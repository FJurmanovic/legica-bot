# Legica Bot

Discord bot that scrapes the https://sib.net.hr/legica-dana website and posts the latest legica-dana post to all discord text channels it has permissions to.

## Features

- Automatically posts new content from the website daily
- Built-in retry mechanism if the post isn't available yet
- Adds rating reactions (1-10) to each post
- REST API for controlling the bot

## Configuration

The bot can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| TOKEN | Discord Bot Token | Required |
| PASSWORD | Admin password for API | Required |
| PORT | Port for the API server | 3000 |
| CRON_LEGICA | CRON schedule for posting | 0 9 * * * |
| TIMEZONE | Timezone for the CRON job | utc |
| LEGICA_DATE_FORMAT | Date format used in posts | D.M.YYYY |
| RETRY_ATTEMPTS | Number of hourly retries if date check fails | 3 |

## Documentation

[Documentation](https://legica.jurmanovic.com/swagger)
