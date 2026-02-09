require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

const users = JSON.parse(fs.readFileSync('./users.json'));

// 🔥 LOGIN + TOKEN DIOTALI EN UNE SEULE API
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // ✅ Vérification utilisateur local
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur inconnu' });
        }

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }

        // ✅ Appel API Diotali
        const response = await axios.post(
            'https://apiaas.diotali.com/compagnie/session/token',
            {
                username: process.env.DIOTALI_USERNAME,
                password: process.env.DIOTALI_PASSWORD,
                grant_type: 'password'
            }
        );

        // ✅ Réponse finale
        res.json({
            success: true,
            user: user.username,
            diotali_token: response.data.access_token || response.data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur API Diotali',
            details: error.response?.data || error.message
        });
    }
});

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API démarrée sur le port ${PORT}`);
});
