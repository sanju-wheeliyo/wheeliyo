import nextConnect from 'next-connect'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import userServices from 'core/services/user.services'

const handler = nextConnect()

handler.get(authenticateTokenMiddleware, async (req, res) => {
    try {
        const user = req.user
        const userData = await userServices.getUserById(user._id)

        if (!userData || !userData.profilePicture) {
            return res.status(404).send('Profile picture not found')
        }

        const profilePicture = userData.profilePicture

        // Set content type
        res.setHeader('Content-Type', profilePicture.contentType)
        res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
        res.setHeader('Content-Disposition', 'inline') // Display inline for images

        // Send the base64 decoded image
        res.send(Buffer.from(profilePicture.data, 'base64'))
    } catch (error) {
        console.error('Error fetching profile picture:', error)
        res.status(500).send('Internal server error')
    }
})

export default handler
