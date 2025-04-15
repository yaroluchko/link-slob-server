# Deploying LinkSlob to Render.com

This guide explains how to deploy the LinkSlob server to Render.com.

## Prerequisites

- A Render.com account
- Git repository with your LinkSlob code

## Deployment Steps

1. **Push your code to a Git repository**
   - Create a new repository on GitHub, GitLab, or Bitbucket
   - Push your LinkSlob code to the repository

2. **Create a new Web Service on Render.com**
   - Log in to your Render.com account
   - Click "New +" and select "Web Service"
   - Connect your Git repository
   - Configure the service:
     - Name: `link-slob` (or your preferred name)
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free (or your preferred plan)

3. **Set Environment Variables**
   - Add the following environment variables:
     - `PORT`: `10000` (or your preferred port)
     - `NODE_ENV`: `production`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

## Important Notes

- The free tier of Render.com may have limitations on uptime and performance
- Render.com might spin down your service after periods of inactivity
- The service URL will be something like `https://link-slob.onrender.com`

## Updating the Creativitas Client

After deploying to Render.com, update your Creativitas AbletonLinkManager.js to use the new server URL:

```javascript
// In AbletonLinkManager.js constructor
this.serverUrl = 'https://link-slob.onrender.com'; // Replace with your actual Render.com URL
```

Or you can set it dynamically:

```javascript
abletonLinkManager.setServerUrl('https://link-slob.onrender.com');
```

## Troubleshooting

- If you encounter build errors, check the build logs in Render.com
- Make sure all dependencies are properly listed in package.json
- Check that the server is listening on the port specified by the PORT environment variable
- Verify that CORS is properly configured to allow connections from your Creativitas application
