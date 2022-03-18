// CHALLENGE: How you convert this to go into the generator?

/*
npx create-nx-workspace@latest hello-react \
    --appName=dashboard \
    --preset=react-express \
    --npmScope=acme \
    --nx-cloud=false \
    --linter=eslint \
    --style=scss && \
 cd hello-react/ && \
 npm install axios && \
 npm install json-server --save-dev && \
 npm install concurrently --save-dev && \
 mkdir server && \
 touch server/db.json && \
 npm install @material-ui/core && \
 nx g lib core-data --component=false && \
 nx g lib core-state --component=false && \
 nx g lib material --component=false && \
 nx g slice courses \
    --project core-state \
    --directory courses \
    --no-interactive \
    --facade && \
 nx g c courses --export=false --routing=true --style=scss && \
 nx g c courses-list --directory=app/courses --export=false --routing=true --style=scss && \
 nx g c courses-details --directory=app/courses --export=false --routing=true --style=scss&& \
 nx g c home --export=false --routing=true --style=scss
 npx concurrently "npm start" "npm start api"
*/
