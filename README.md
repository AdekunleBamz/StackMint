# Stacksmint Frontend

This repository contains the Stacksmint frontend (Next.js + Tailwind) and smart contracts.

## Stacks integration

This project uses the following Stacks packages in the frontend:

- `@stacks/connect` — wallet connection and auth flows
- `@stacks/transactions` — build and broadcast transactions to the Stacks network

Usage notes:

- Use `@stacks/connect`'s `openContractCall` and `showConnect` to prompt the user for signing transactions.
- Use `@stacks/transactions` to construct, sign, and serialize transactions in JS. Example flow:

```js
import { makeSTXTokenTransfer } from '@stacks/transactions';

const tx = await makeSTXTokenTransfer({
  recipient: 'SP1234...',
  amount: 1000000,
  fee: 500,
  nonce: 0,
  senderKey: PRIVATE_KEY, // don't store private keys in client
});

// send via API or through wallet provider
```

Security reminder: transaction signing should happen in the user's wallet whenever possible (use `@stacks/connect`), and private keys should never be embedded in the client.

## Local development

- Install dependencies: `pnpm install` or `npm install`
- Run dev server: `pnpm dev` or `npm run dev`

## Notes added by the UI/UX improvement sweep

- Improved accessibility (focus-visible, keyboard navigation)
- Enhanced loading skeletons and animations
- Better input validation visuals
- More consistent theme colors and hover interactions

