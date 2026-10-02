# SpiceGarden — Load-Generator Capacity Boundaries

**Audit Finding:** The single-workstation test environment (Windows 11, Intel i3 2C/4T, 8 GB RAM) is capable of generating load cleanly up to **10,000 VUs**.

---

## 1. Workstation Bottleneck Analysis at 30k Target

* **Ephemeral Port Cap:** Windows default dynamic port pool is 16,384 ports (`netsh int ipv4 show dynamicport tcp`).
* **Socket Allocation Failure:** At 22,400 VUs, the OS returned `WSAENOBUFS (10055)` because local k6 and local Node.js backend exhausted the socket table.
* **Conclusion:** Tests above 20,000 VUs require a multi-node Linux load generation cluster.
