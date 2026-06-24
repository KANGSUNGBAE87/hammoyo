# Graph Refresh Result

Command sequence executed from terminal:

```bash
cd /Users/kangsungbae/Documents/지식저장소/planning-lab && graphify update . --no-cluster
HOME=/Users/kangsungbae graphify global add /Users/kangsungbae/Documents/지식저장소/planning-lab/graphify-out/graph.json --as planning-lab
cd /Users/kangsungbae/Documents/hammoyo && graphify update . --no-cluster
HOME=/Users/kangsungbae graphify global add /Users/kangsungbae/Documents/hammoyo/graphify-out/graph.json --as hammoyo
HOME=/Users/kangsungbae graphify global list | grep -E 'planning-lab|hammoyo'
```

Observed output summary:
- Planning Lab local graph rebuilt: 1697 nodes, 39769 edges.
- Global add `planning-lab`: +2069 nodes, -1748 pruned.
- Hammoyo project graph rebuilt: 127 nodes, 741 edges.
- Global add `hammoyo`: +127 nodes, -127 pruned.
- Global list includes `planning-lab` and `hammoyo`, added 2026-06-23.
