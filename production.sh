#! /bin/sh
pm2 start --merge-logs --log-date-format="YYYY-MM-DD HH:mm Z" --cron "0 */4 * * *" -n cloudflare cloudflare.js
