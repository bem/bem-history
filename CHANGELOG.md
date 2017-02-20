# Changelog

## 4.0.0

### Breaking changes
* `uri` block is now `Uri` class provided by `uri__querystring` to support changes in `bem-core v4`

### Bug fixes
* Silent mode for `location` block was fixed ([#50](https://github.com/bem/bem-history/pull/#50))
* Security error was fixed: `location` block now throws an exception when trying to change location to different domain ([#49](https://github.com/bem/bem-history/pull/49))
