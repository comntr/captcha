# Interface

1. `GET /question/qwerty` returns a SVG picture with a question like `23+34`. The question is derived from `SHA1(qwerty)`. It's allowed to add `?foo=123` to the URL to force the browser to reload the picture. Example: https://comntr.live:2556/question/qwerty
2. `GET /postmark/qwerty?answer=57` returns a `ed25519` signature for `SHA1(qwerty)`. If the response is `401`, the answer is wrong. Example: https://comntr.live:2556/postmark/qwerty?answer=123
3. `GET /keys` returns `ed25519` public keys with their expiration dates. Example: https://comntr.live:2556/keys

# Build

`npm start` starts the service on port `2556`.

# Docs

https://comntr.github.com/comntr/webext/docs/captcha.md

# License

TBD
