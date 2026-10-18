# Homico

Homico is split into a Node.js/Express API and a Vite/React client.

```
homico-main/
├── backend/   # API, tests, scripts and API documentation
└── frontend/  # React application and UI documentation
```

Run each application in a separate terminal:

```sh
# backend (needs MongoDB)                 # frontend
cd backend                                cd frontend
cp .env.example .env                      cp .env.example .env # optional
npm install                               npm install
npm run seed                              npm run dev # http://localhost:5173
npm run dev # API on http://localhost:8000/api
```

See [backend documentation](backend/README.md) for API setup and demo
credentials, and [frontend documentation](frontend/README.md) for the client.
