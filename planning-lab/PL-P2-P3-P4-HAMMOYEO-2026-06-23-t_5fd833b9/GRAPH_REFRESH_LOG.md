# Graph Refresh Log

- [FACT] Planning Lab local graph refreshed from `/Users/kangsungbae/Documents/지식저장소/planning-lab` with `graphify update . --no-cluster`.
- [FACT] Planning Lab local graph registered to the real user global graph with `HOME=/Users/kangsungbae graphify global add /Users/kangsungbae/Documents/지식저장소/planning-lab/graphify-out/graph.json --as planning-lab`.
- [FACT] A first registration attempt without `HOME=/Users/kangsungbae` wrote to the planning-chair profile home global path; the corrected command updated `/Users/kangsungbae/.graphify/global-graph.json`.
- [FACT] Hammoyo project graph refreshed from `/Users/kangsungbae/Documents/hammoyo` with `graphify update . --no-cluster`.
- [FACT] Hammoyo project graph registered with `HOME=/Users/kangsungbae graphify global add /Users/kangsungbae/Documents/hammoyo/graphify-out/graph.json --as hammoyo`.
- [FACT] Verification command `cd /Users/kangsungbae/Documents/지식저장소/planning-lab && HOME=/Users/kangsungbae graphify query '함모여 t_5fd833b9 P4 package' --limit 5` returned a scoped graph containing `함모여` from `00_SYSTEM/TOPIC_MAP.md`.
- [INFERENCE] Graph refresh requirement is satisfied for this source/index/final-package update.
