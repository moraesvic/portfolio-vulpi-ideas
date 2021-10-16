## Portfolio Vulpi Ideas
[VULPI Ideas](https://vulpi-ideas.com) is my first full-fledged website, and the one I am still working on. I started it in April 2021, and it has been a great exercise in learning web development. But, as you can imagine, as I am the sole developer and was still learning it, the original repo is a bit messy, with some "to-do" folders, commit messages both in Portuguese and in English, and so on. But, in spite of that, I am very proud of it, so I decided to copy the original project and start a public repository with a cleaner working version.

With my website, I have two goals: to implement tools for language learning &mdash; dictionaries, text navigators, flashcards, etc ; and to showcase my work and document my journey as a web developer. There are always things I would like to refactor or entirely recode with other frameworks, therefore, it is a work in progress. Nevertheless, it works, the design makes sense and everything is well-documented.

## Installation
In all paths given below, __root__ refers to __project root__, i.e., **/src** corresponds to **/path/to/portfolio-vulpi-ideas/src** .

Please make sure that MongoDB is properly installed and enabled in your system. Then, install all Node dependencies with **npm i** (with project root as working directory), and run server as **npm run prod** (or **npm run dev** for development mode). If you run in production mode, you will need to configure Nginx to serve static files from the **/public/** folder. Now your server is running at **http://localhost:5000** !

Next thing would be installing the barebones of the database. Go to **/src/admin/db** and run **node restartDB.js**. This will enable the MongoDB collections needed, and add a couple dictionaries and words.

You should now register an account for yourself and make this account into an admin, so you can change details of the database using the web frontend. For that, run **node /src/admin/changeUserPriviledge.js** and go through the shell wizard to give the desired user admin priviledges.

## PostgreSQL
In this version, there is no proper support for Postgres. In the future, I wish to recode all Mongo routines using Postgres. However, if you want to checkout what has been done so far, please refer to directory **/postgresql** with data structures and procedures. In **/src/db/postgres.js** you will find the Postgres middleware I wrote for **pg** library. Running the script **/postgresql/import.sh** is how one will be able to install and configure Postgres database.

## Live demo
Check a live demo at my homepage [VULPI Ideas](https://vulpi-ideas.com) !

## Contact
[Email](mailto:victor@vulpi-ideas.com)
[LinkedIn](https://www.linkedin.com/in/victor-moraes/)


