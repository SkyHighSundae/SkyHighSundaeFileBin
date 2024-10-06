# SkyHighSundaeFileBin

SkyHighSundaeFileBin is an open-source alternative to Gofile, designed for secure file sharing and storage. It provides an easy-to-deploy solution that can be self-hosted for complete control over your file-sharing needs.

## Features

- **Open Source**: Free to use and modify under the MIT license.
- **Secure**: Self-host your file-sharing platform for total control over security.
- **Simple Setup**: Get your server up and running quickly with minimal configuration.

## How to Self-host SkyHighSundaeFileBin

Follow these steps to set up your own SkyHighSundaeFileBin instance:

### Prerequisites

- Node.js (v14 or later)
- npm (Node package manager)

### Step-by-Step Instructions

1. **Clone the repository** to your server:
    ```bash
    git clone https://github.com/your-repo/SkyHighSundaeFileBin.git
    cd SkyHighSundaeFileBin
    ```

2. **Install the required dependencies**:
    ```bash
    npm install
    ```

3. **Set the admin key**:
    - Open the `admin.json` file.
    - Replace the default admin key with a secure key of your choice (do NOT use the default one).

4. **Run the application**:
    ```bash
    node app.js
    ```

5. **Access your instance**:
    - Open your web browser and go to `http://localhost:3000` to start using SkyHighSundaeFileBin.

### Configuration

You can modify files and ban IPs in the Admin Panel


## Contributions

Feel free to contribute to this project! Open issues, fork the repository, and submit pull requests. We welcome all improvements and ideas to make SkyHighSundaeFileBin better.

---

Happy hosting with SkyHighSundaeFileBin!
