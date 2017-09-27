# Table builder

Building evidence tables to justify decisions for human-health decisions can be
cumbersome, and often times the data which are entered in these tables can be
reused for subsequent analyses. However, the tables impose certain formatting
conventions for conciseness in the table.

This application attempts to create a simple web-application for adding data to
a table, and will allow for customized Excel reports for downloading the data
in both formatted-tables and raw-tabular format which is more amenable for
statistical modeling.

## Development notes

Global installation requirements:

1. install [meteor](http://docs.meteor.com)
2. install [mongodb](https://docs.mongodb.com/manual/installation/)

Then, in the root directory of the application:

1. install python2 dependencies with `pip install -r requirements.txt`
2. install R and R dependencies with `bash requirements.sh`
3. install javascript dependencies with `cd src && meteor npm install --save bcrypt babel-runtime python-shell xlsx d3 underscore filesaver.js`

### Editing the settings.json

Three fields are required to be modified in `./settings/settings.json`:

- `scripts_path` is the absolute path to the `tblBuilder/src/private/scripts` folder.
- `python_path` is the absolute path to Python 2.7.
- `public.context` determines which platform you're targeting; should be either `ntp` or `iarc`.

### Create admin user

To create an admin in the database, modify `bin/createSuperuser.js` with the username, email address and password you would like to use. Then run `meteor shell` to open up the meteor shell and run `.load ./bin/createSuperuser.js` to create your admin user.

### Loading dev database

If you've been supplied with a development database, move it to your desktop and make sure Mongo is running, then load it into Mongo by running the commands:

```bash
unzip ~/Desktop/'Backup-Date'-backup.zip -d ~/Desktop/_extracted
mongorestore --drop --host localhost:3001 -d meteor ~/Desktop/_extracted
rm –rf ~/Desktop/_extracted
```

### Running the dev environment

A basic dev environment using [tmux](https://github.com/tmux/tmux/wiki) is set up with the Makefile. Start the dev environment by running `make dev`.

## Production notes

Deploy using docker; view the `docker-compose.yml` for more details.
