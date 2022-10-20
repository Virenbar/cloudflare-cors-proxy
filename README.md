# cloudflare-cors-proxy

Simple CORS proxy for cloudflare workers

## Deploying

1. Change `id` in `kv_namespaces` to your Namespace ID  
Namespace should contain `whitelist` key with array of domains (`["example.org","..."]`)
2. Deploy

    ```bash
    yarn run deploy
    ```
