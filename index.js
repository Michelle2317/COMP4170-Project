import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import session from 'express-session';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// normally, this would be stored in a .env file, but for the simplicity we will be sharing it here
app.use(
	session({
		secret: 'deardiary',
		resave: false,
		saveUninitialized: true,
	})
);

const db = new pg.Client({
	user: 'postgres',
	host: 'localhost',
	database: 'diary',
	password: 'michelle',
	port: 5432,
});
db.connect();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index.ejs', { title: 'Home' });
});

app.get('/register', (req, res) => {
	res.render('register.ejs', { title: 'Register' });
});

app.post('/register', async (req, res) => {
	const username = req.body.user_username;
	const password = req.body.user_password;

	try {
		const checkResult = await db.query(
			'SELECT * FROM users WHERE username = $1',
			[username]
		);

		if (checkResult.rows.length > 0) {
			res.send(
				'Account already exists. Try logging in to your account'
			);
		} else {
			const result = await db.query(
				'INSERT INTO users (username, password) VALUES ($1, $2)',
				[username, password]
			);
			res.render('dashboard.ejs', {
				title: 'Dashboard',
				username,
			});
		}
	} catch (err) {
		console.log(err);
	}
});

app.get('/login', (req, res) => {
	res.render('login.ejs', { title: 'Login' });
});

app.post('/login', async (req, res) => {
	const username = req.body.user_username;
	const password = req.body.user_password;

	try {
		const result = await db.query(
			'SELECT * FROM users WHERE username = $1',
			[username]
		);
		if (result.rows.length > 0) {
			const user = result.rows[0];
			const storedPassword = user.password;

			if (password === storedPassword) {
				req.session.userId = user.id;
				req.session.username = user.username;
				res.render('dashboard.ejs', {
					title: 'Dashboard',
					username: req.session.username,
				});
			} else {
				res.send('Incorrect password');
			}
		} else {
			res.send('User not found');
		}
	} catch (err) {
		console.log(err);
	}
});

app.get('/dashboard', (req, res) => {
	res.render('dashboard', {
		title: 'Dashboard',
		username: req.session.username,
	});
});

app.get('/create', (req, res) => {
	res.render('create.ejs', { title: 'Create Diary' });
});

app.post('/create', async (req, res) => {
	const { entry_title, entry_content } = req.body;
	const userId = req.session.userId;

	try {
		const result = await db.query(
			'INSERT INTO diaries (user_id, title, content) VALUES ($1, $2, $3) RETURNING id',
			[userId, entry_title, entry_content]
		);

		const entryId = result.rows[0].id;

		res.redirect(`/view?entryId=${entryId}`);
	} catch (err) {
		console.log(err);
		res.status(500).send('Error saving diary');
	}
});

app.get('/view', async (req, res) => {
	const entryId = req.query.entryId;
	const userId = req.session.userId;

	try {
		const result = await db.query(
			'SELECT * FROM diaries WHERE id = $1 AND user_id = $2',
			[entryId, userId]
		);

		if (result.rows.length === 0) {
			return res.status(404).send('Entry not found');
		}

		const entry = result.rows[0];

		res.render('view.ejs', {
			title: 'View Entry',
			entryTitle: entry.title,
			entryContent: entry.content,
		});
	} catch (err) {
		console.log(err);
		res.status(500).send('Error fetching diary entry');
	}
});

app.get('/edit', (req, res) => {
	res.render('edit', { title: 'Edit Diary' });
});

app.get('/delete', (req, res) => {
	res.render('delete', { title: 'Delete Diary' });
});

app.listen(3000, () => {
	console.log(`App listening at port 3000`);
});
