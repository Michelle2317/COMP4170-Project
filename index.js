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

/* normally, this would be stored in a .env file, but for the simplicity we will be sharing it here
 Session middleware to track user sessions */
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
				res.redirect('/dashboard');
			} else {
				res.send('Incorrect password');
			}
		} else {
			res.send('User not found');
		}
	} catch (err) {
		console.log(err);
		res.status(500).send('Error during login');
	}
});

app.get('/dashboard', async (req, res) => {
	const userId = req.session.userId; //get logged-in user's id from the session

	if (!userId) {
		return res.redirect('/login');
	}

	try {
		// Query the database to get all diary entries for the logged-in user, ordered by creation date
		const result = await db.query(
			'SELECT * FROM diaries WHERE user_id = $1 ORDER BY created_at DESC',
			[userId]
		);

		const entries = result.rows; // Store the retrieved entries

		res.render('dashboard', {
			title: 'Dashboard',
			username: req.session.username,
			entries: entries,
		});
	} catch (err) {
		console.log(err);
		res.status(500).send('Error fetching diary entries');
	}
});

app.get('/create', (req, res) => {
	res.render('create.ejs', { title: 'Create Diary' });
});

app.post('/create', async (req, res) => {
	const { entry_title, entry_content } = req.body; // Get title and content from request body
	const userId = req.session.userId; // Get the logged-in user's id from the session

	try {
		// Insert the new diary entry into the database and return the created entry id
		const result = await db.query(
			'INSERT INTO diaries (user_id, title, content) VALUES ($1, $2, $3) RETURNING id',
			[userId, entry_title, entry_content]
		);

		const entryId = result.rows[0].id; // Get the newly created entry id

		// after creating, redirect to the view page to see the new entry
		res.redirect(`/view?entryId=${entryId}`);
	} catch (err) {
		console.log(err);
		res.status(500).send('Error saving diary');
	}
});

app.get('/view', async (req, res) => {
	const entryId = req.query.entryId; // Get the entry id from query parameters
	const userId = req.session.userId; // Get the logged-in user's id from the session

	if (!userId) {
		return res.redirect('/login');
	}

	try {
		// Query the diaries database to find the specific diary entry for the logged-in user
		const result = await db.query(
			'SELECT * FROM diaries WHERE id = $1 AND user_id = $2',
			[entryId, userId]
		);

		// If no matching entry is found, send a 404 error
		if (result.rows.length === 0) {
			return res.status(404).send('Entry not found');
		}

		const entry = result.rows[0]; // Get the diary entry data

		// Render the view entry page, passing the entry data to this view
		res.render('view.ejs', {
			title: 'View Entry',
			entry: entry,
			entryTitle: entry.title,
			entryContent: entry.content,
		});
	} catch (err) {
		console.log(err);
		res.status(500).send('Error fetching diary entry');
	}
});

// Get the edit page with the current diary entry data
app.get('/edit', async (req, res) => {
	const entryId = req.query.entryId; // Retrieve the entryId from the query parameters
	const userId = req.session.userId; // Get the logged-in user's id from the session

	try {
		// Query the diaries database to find the specific diary entry for the logged-in user
		const result = await db.query(
			'SELECT * FROM diaries WHERE id = $1 AND user_id = $2',
			[entryId, userId]
		);

		// If no matching entry is found, send a 404 error
		if (result.rows.length === 0) {
			return res.status(404).send('Entry not found');
		}

		const entry = result.rows[0]; // Get the diary entry data from the result

		// Render the edit page and pass the entry data to the view page
		res.render('edit.ejs', {
			title: 'Edit Entry',
			entryId: entry.id,
			entryTitle: entry.title,
			entryContent: entry.content,
		});
	} catch (err) {
		console.log(err);
		res.status(500).send('Error fetching diary entry');
	}
});

// Handle the form submission to update the diary entry
app.post('/edit', async (req, res) => {
	const { entryId, entry_title, entry_content } = req.body; // Get the new title and content from the form data
	const userId = req.session.userId; // Get the logged-in user's id from the session

	try {
		// Update the diary entry in the database with the new title and content
		const result = await db.query(
			'UPDATE diaries SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
			[entry_title, entry_content, entryId, userId]
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.send('Entry not found or unauthorized');
		}

		// Redirect to the view page to show the updated diary entry
		res.redirect(`/view?entryId=${entryId}`);
	} catch (err) {
		console.error('Error updating entry:', err);
		res.status(500).send('Error updating diary entry');
	}
});

app.get('/delete', async (req, res) => {
	const entryId = req.query.entryId; // Get the entryId from the query parameter
	const userId = req.session.userId; // Get the userId from the session

	try {
		// Query the diaries database to find the specific diary entry for the logged-in user
		const result = await db.query(
			'SELECT * FROM diaries WHERE id = $1 AND user_id = $2',
			[entryId, userId]
		);

		// If no matching entry is found, send a 404 error
		if (result.rows.length === 0) {
			return res
				.status(404)
				.send('Entry not found or unauthorized');
		}

		// Get the entry data from the result
		const entry = result.rows[0];

		// Render the delete confirmation page with the entry title and id
		res.render('delete.ejs', {
			title: 'Delete Entry',
			entryTitle: entry.title,
			entryId: entry.id,
		});
	} catch (err) {
		console.log(err);
		res.status(500).send('Error fetching diary entry');
	}
});

app.post('/delete', async (req, res) => {
	const entryId = req.body.entryId; // Get the entryId from the form
	const userId = req.session.userId; // Get the logged-in user's id from the session

	try {
		// Delete the diary entry from the database
		const result = await db.query(
			'DELETE FROM diaries WHERE id = $1 AND user_id = $2 RETURNING *',
			[entryId, userId]
		);

		// If no matching entry is found, send a 404 error
		if (result.rows.length === 0) {
			return res
				.status(404)
				.send('Entry not found or unauthorized');
		}

		// Redirect to the dashboard after deleting the entry
		res.redirect('/dashboard');
	} catch (err) {
		console.error('Error deleting entry:', err);
		res.status(500).send('Error deleting diary entry');
	}
});

app.listen(3000, () => {
	console.log(`App listening at port 3000`);
});
