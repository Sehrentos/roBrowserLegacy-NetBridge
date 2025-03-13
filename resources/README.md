## Client resources directory

Add all client related files here.

Folder structure:
- AI - user AI files
- BGM - user audio files
- data - any extracted data files e.g. `clientinfo.xml`
- System - user System files
- data.ini
- README.md *(this file)*
- *.grf - compressed data files

> [!NOTE]
> - You dont need to replace the lua/lub files `dofile` or `require "AI\\Const"` paths. Server will handle the change and set `Cache-control` for caching.

## DATA.ini
```text
[Data]
1=adata.grf
2=bdata.grf
3=cdata.grf
```
