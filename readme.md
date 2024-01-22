Don't use nodemon when running app.js, the data files update nodemon and will log you out. simply use "node app.js" for best user experience.

- GET /cards will let you search through the cards
- POST /cards/create will let you make a new card
- /cards/:id will let you edit existing cards or delete existing card depedning on if you use "PUT" or "DELETE"

I add a feature to keep you logged in instead of manually entering the jwt key for every protected endpoint.
hope that helps :)
