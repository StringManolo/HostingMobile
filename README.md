## HostingMobile

Enabling services hosting directly from mobile devices, effectively bypassing Carrier-Grade NAT (CG-NAT) restrictions.

## HOW IT WORKS

### STEP 1: Cloudflare Account Setup

Create a Cloudflare account and log in to the dashboard.

### STEP 2: Domain Acquisition and DNS Delegation

Obtain a domain. You can purchase one or use a free subdomain service. One option is: [https://nic.eu.org/arf/en/domain/new/](https://nic.eu.org/arf/en/domain/new/)

During the domain registration process, you must input the custom nameservers provided by Cloudflare to delegate DNS control (e.g., `odin.ns.cloudflare.com` and `sue.ns.cloudflare.com`).

*Note: Services like nic.eu.org manually process new domain requests, so approval may take some time.*

Ensure Cloudflare is monitoring the domain. You will see a pending message until the nameserver update propagates, confirming that Cloudflare is ready to manage your DNS records.

### Step 3: Cloudflare Tunnel Creation

Create a Cloudflare Tunnel through the Zero Trust Dashboard, which provides the necessary infrastructure for secure, egress-only connectivity.

*Go to the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/). You may be prompted to enter payment details, but the core Tunnel functionality is free.*

### Step 4: Prepare the Local Service

Download this repository. It includes a basic Node.js Express server to demonstrate service hosting. You may substitute this with any service you wish to expose.

First, install Node.js:

```bash
# Install Node.js on Termux
pkg install nodejs
# Install Node.js on Debian
apt install nodejs -y
# Install Node.js on Alpine
apk add nodejs
```

Then, download and set up the sample server:

```bash
# Download repo and node server
git clone https://github.com/stringmanolo/hostingmobile
cd hostingmobile
npm install
chmod +x index.js
```

### Step 5: Install the Cloudflared CLI

Download the `cloudflared` CLI tool binary from the official releases page.

For most modern smartphones (running Linux/Android), the correct binary is likely `arm64/aarch64`.

```bash
curl -LO https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
mv cloudflared-linux-arm64 cloudflared
chmod +x cloudflared

# Move it to a directory included in your PATH:
# Termux:
# mv cloudflared ~/../usr/bin/
# Debian proot-distro:
# mv cloudflared /bin/
```

*Verification: Run `cloudflared --version` to confirm installation.*

### Step 6: Initial Tunnel Test (Temporary URL)

Start your local service and launch a quick tunnel to test basic connectivity.

```bash
./index.js &
cloudflared tunnel --url http://localhost:3000
```

`cloudflared` will output a log entry showing the temporary public URL where your service is accessible:

```log
2025-12-10T03:08:52Z INF Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
2025-12-10T03:08:52Z INF https://engagement-collapse-renewable-obituaries.trycloudflare.com
```

Accessing this URL should display the confirmation message: **Hello World from behind CG-NAT\!**

### Step 7: Persistent Tunnel with Custom Domain

To use your custom domain and establish a permanent link, configure a named tunnel.

1.  **Login:** Authenticate `cloudflared` with your Cloudflare account.

    ```bash
    cloudflared login
    ```

    Follow the prompts to open a URL in your browser and select your account/domain.

2.  **Create Tunnel:** Create a new named tunnel.

    ```bash
    cloudflared tunnel create tunel-hostingmobile
    ```

3.  **Route DNS:** Connect the tunnel to your domain. This automatically creates the necessary CNAME record in your Cloudflare DNS settings.

    ```bash
    cloudflared tunnel route dns tunel-hostingmobile stringmanolo.net.org.eu
    ```

4.  **Configuration File:** Create a `config.yml` file to define the service routing rules. **Crucially, ensure there are no comments in the code, as per your instruction.**

    ```yml
    ```

tunnel: tunel-hostingmobile
credentials-file: /root/.cloudflared/4\*\*\*\*.json
ingress:

  - hostname: stringmanolo.net.org.eu
    service: http://localhost:3000
  - service: http\_status:404
    ```
    
    ```

<!-- end list -->

5.  **Run Persistent Tunnel:** Start the tunnel using the configuration file.
    ```bash
    cloudflared tunnel --config config.yml run
    ```
    Ensure your local service is running on the specified port (e.g., `./index.js &`).

### Step 8: Exposing Other Services (SSH, RDP, TCP)

Cloudflare Tunnel natively supports tuneling protocols other than HTTP/HTTPS (on port 443). This eliminates the need for external tools like Chisel.

To expose services like SSH, you must specify the protocol in the `config.yml`:

```yml
ingress:
  - hostname: ssh.stringmanolo.net.org.eu
    service: ssh://localhost:8022
    # ssh:// enables Zero Trust features. Use tcp://localhost:8022 for simple Raw TCP.

  - hostname: rdp.stringmanolo.net.org.eu
    service: rdp://localhost:3389

  # ... your web services
```
