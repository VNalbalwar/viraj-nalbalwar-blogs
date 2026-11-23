# Topic bank

Prioritise topics a developer would search for. Skip anything in `state.json` `covered`. Add new ideas at the bottom; the writer is free to pick something better that fits the lane.

## Explainer lane (Linux, systems, cloud, GPU/ML infrastructure)
- How cgroups v2 divides CPU time: `cpu.weight` versus `cpu.max`
- What `Persistent=true` on a systemd timer really does after a missed run
- Reading an SELinux AVC denial and fixing it without `setenforce 0`
- How the Kubernetes CPU Manager "static" policy pins cores to pods
- GPU time-slicing, MPS and MIG: what each one isolates
- How pacman hooks work and what runs after an Arch upgrade
- What the Linux OOM killer scores and why it picks your process
- Why containers see the host's CPU count and how to make them stop
- How OpenStack Nova schedules an instance onto a compute node
- What happens between `kubectl apply` and a running pod
- NUMA in plain terms: why memory placement changes performance
- How Hyprland reloads its config and which settings need a restart

## News lane
Look for: new model or paper releases from major labs, notable Linux kernel or distro releases, Kubernetes/OpenStack/OpenShift releases, NVIDIA/GPU software changes, security advisories that affect developers, significant changes to developer tools. Prefer the primary announcement and at least one independent analysis.

## Notes lane
Only runs when a note in `pipeline/notes/` has `status: ready`. See `pipeline/notes/README.md`.
