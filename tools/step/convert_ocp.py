# Reads an assembly STEP with native OpenCascade (XCAF) and writes build/assembly.json:
#   protos:    one mesh per unique solid, in its own coordinates, with B-rep face ranges
#              (so CAD edges can be told apart from tessellation edges later)
#   instances: every placed copy of a proto, with its product-tree path, 3x4 world
#              matrix and world bounding box
# The Trident STEP reuses definitions (one M5x10 BHCS body placed hundreds of times), so
# meshing each definition once keeps this fast and small.
# Usage: .venv/bin/python tools/step/convert_ocp.py <file.step> build/assembly.json [deflection=0.2] [angle=0.5]
import json, sys, time
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString
from OCP.XCAFDoc import XCAFDoc_DocumentTool
from OCP.TDF import TDF_Label
from OCP.OCP.collections import Sequence_TDF_Label as TDF_LabelSequence  # OCP 8 name
from OCP.TDataStd import TDataStd_Name
from OCP.TopLoc import TopLoc_Location
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID, TopAbs_FACE, TopAbs_REVERSED
from OCP.TopoDS import TopoDS
from OCP.BRep import BRep_Tool
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.IFSelect import IFSelect_RetDone

src, out = sys.argv[1], sys.argv[2]
defl = float(sys.argv[3]) if len(sys.argv) > 3 else 0.2
ang = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
t0 = time.time()

doc = TDocStd_Document(TCollection_ExtendedString('doc'))
reader = STEPCAFControl_Reader()
reader.SetNameMode(True)
if reader.ReadFile(src) != IFSelect_RetDone: raise SystemExit('STEP read failed')
reader.Transfer(doc)
tool = XCAFDoc_DocumentTool.ShapeTool_s(doc.Main())
print(f'read {time.time() - t0:.0f} s', file=sys.stderr)

def name_of(label):
    attr = TDataStd_Name()
    return attr.Get().ToExtString() if label.FindAttribute(TDataStd_Name.GetID_s(), attr) else ''

def matrix(loc):
    t = loc.Transformation()
    return [round(t.Value(r, c), 6) for r in (1, 2, 3) for c in (1, 2, 3, 4)]

def apply(m, p):
    x, y, z = p
    return (m[0]*x + m[1]*y + m[2]*z + m[3], m[4]*x + m[5]*y + m[6]*z + m[7], m[8]*x + m[9]*y + m[10]*z + m[11])

protos, proto_index, instances = [], {}, []

def mesh_solid(solid):
    BRepMesh_IncrementalMesh(solid, defl, False, ang, True)
    pos, idx, faces = [], [], []
    exp = TopExp_Explorer(solid, TopAbs_FACE)
    while exp.More():
        face = TopoDS.Face(exp.Current())
        loc = TopLoc_Location()
        tri = BRep_Tool.Triangulation_s(face, loc)
        first = len(idx) // 3
        if tri is not None:
            trsf = loc.Transformation()
            base = len(pos) // 3
            for i in range(1, tri.NbNodes() + 1):
                p = tri.Node(i).Transformed(trsf)
                pos += [round(p.X(), 3), round(p.Y(), 3), round(p.Z(), 3)]
            rev = face.Orientation() == TopAbs_REVERSED
            for i in range(1, tri.NbTriangles() + 1):
                a, b, c = tri.Triangle(i).Get()
                idx += [base + a - 1, base + c - 1, base + b - 1] if rev else [base + a - 1, base + b - 1, base + c - 1]
        faces.append([first, len(idx) // 3 - 1])
        exp.Next()
    return {'position': pos, 'index': idx, 'faces': faces}

def walk(label, loc, path):
    if tool.IsAssembly_s(label):
        comps = TDF_LabelSequence()
        tool.GetComponents_s(label, comps)
        for i in range(1, comps.Length() + 1):
            comp = comps.Value(i)
            ref = TDF_Label()
            tool.GetReferredShape_s(comp, ref)
            walk(ref, loc.Multiplied(tool.GetLocation_s(comp)), path + [name_of(comp) or name_of(ref)])
        return
    shape = tool.GetShape_s(label)
    exp = TopExp_Explorer(shape, TopAbs_SOLID)
    n = 0
    while exp.More():
        solid = exp.Current()
        key = (label.Tag(), label.Father().Tag(), n)
        if key not in proto_index:
            proto_index[key] = len(protos)
            protos.append({'name': name_of(label), **mesh_solid(solid)})
        p = proto_index[key]
        # The solid's own placement inside its shape is already baked into the proto mesh.
        m = matrix(loc)
        pts = [apply(m, protos[p]['position'][i:i + 3]) for i in range(0, len(protos[p]['position']), 3)]
        bb = [[round(min(q[k] for q in pts), 2) for k in range(3)], [round(max(q[k] for q in pts), 2) for k in range(3)]] if pts else None
        instances.append({'proto': p, 'name': path[-1] if path else name_of(label), 'path': path, 'matrix': m, 'bbox': bb})
        n += 1
        exp.Next()

roots = TDF_LabelSequence()
tool.GetFreeShapes(roots)
for i in range(1, roots.Length() + 1):
    r = roots.Value(i)
    walk(r, TopLoc_Location(), [name_of(r)])

tris = sum(len(p['index']) // 3 for p in protos)
json.dump({'protos': protos, 'instances': instances}, open(out, 'w'), separators=(',', ':'))
print(f'{len(protos)} unique solids ({tris} triangles), {len(instances)} instances, {time.time() - t0:.0f} s -> {out}', file=sys.stderr)
