# Sunology Sabian Widget API

This repository contains the server-side code for the Sunology Sabian Symbol API,
which calculates the Sun’s zodiacal degree and returns the corresponding Sabian
symbol and interpretation.

Planetary positions are calculated using the Swiss Ephemeris library via the
`sweph` Node.js bindings. Swiss Ephemeris data files are used server-side only
and are not redistributed to end users.

## License

This project is licensed under the GNU Affero General Public License,
version 3 or later (AGPL-3.0-or-later).

In accordance with AGPL Section 13, the complete corresponding source code for
the running service is made available at:

https://github.com/sharonssunology/sunology-sabian-widget.

Additional licensing and attribution information can be found in the `NOTICE`
file.

## Usage

This API is intended to be consumed by client applications (such as web widgets)
over HTTP. It is not distributed as a standalone application.

See `/api/source` on the deployed service for license and source information.
