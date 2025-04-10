### Run backend api
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload


### Visualize DUckdb 

[Install duckdb cli](https://duckdb.org/docs/installation/?version=stable&environment=cli&platform=linux&download_method=direct&architecture=x86_64)

```bash
brew install duckdb
```

Open duckdb ui
```bash
duckdb -ui
```

add path :  onboardify.duckdb

