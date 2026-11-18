# AssessPrep frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, proxies /api to http://localhost:8080
npm test -- --run    # unit tests (countdown logic)
npm run build        # production build in dist/
```

Container (serves the build with nginx and proxies /api to the backend):

```bash
docker build -t assessprep-frontend .
docker run -p 3000:8080 -e API_UPSTREAM=http://host.docker.internal:8080 assessprep-frontend
```

Make sure the topic values in the dropdown (JAVA, SQL, DSA, DBMS) match what your question bank uses.
