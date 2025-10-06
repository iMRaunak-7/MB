To push to GitHub using HTTPS, you'll need to:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token
2. Select the necessary scopes (at minimum, select "repo")
3. Generate the token and copy it
4. Use the token as your password when pushing to GitHub

Or, set up SSH keys:

1. Check if you have SSH keys: `ls -la ~/.ssh`
2. If needed, generate new keys: `ssh-keygen -t ed25519 -C "raunakgyan38@gmail.com"`
3. Add the key to the SSH agent: `ssh-add ~/.ssh/id_ed25519`
4. Copy your public key: `cat ~/.ssh/id_ed25519.pub`
5. Add this key to your GitHub account (GitHub → Settings → SSH and GPG keys)
6. Change your remote to SSH: `git remote set-url origin git@github.com:iMRaunak-7/MB.git`
7. Try pushing again: `git push -u origin main`