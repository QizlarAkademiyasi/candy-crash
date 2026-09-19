/**
 * Self-host stub replacing GameMonetize / portal SDK (no ads, no external calls).
 */
;(function () {
  'use strict'

  var STORAGE_PREFIX = 'candy-crush:'

  window.SDK_OPTIONS = window.SDK_OPTIONS || {}

  window.sgSettings = {
    config: {
      user: {
        userId: 'local-guest',
        name: 'Guest',
        avatar: '',
      },
      moreGames: {
        displayButton: false,
      },
    },
  }

  window.AnbycookGP = function () {}

  function noop() {}

  window.sdk = {
    showBanner: noop,
    showInterstitial: noop,
  }

  function runCallback(cb, scope, args) {
    if (typeof cb !== 'function') return
    try {
      cb.apply(scope || null, args || [])
    } catch (e) {
      console.warn('[ad-stub] callback error', e)
    }
  }

  window.sdkHandler = {
    trigger: function (event, payload, scope) {
      payload = payload || {}
      switch (event) {
        case 'gameTracking':
        case 'moreGames':
          break

        case 'save':
          try {
            if (payload.key != null) {
              localStorage.setItem(STORAGE_PREFIX + payload.key, String(payload.value))
            }
          } catch (e) {
            console.warn('[ad-stub] save failed', e)
          }
          runCallback(payload.callback, scope)
          break

        case 'restore':
          try {
            var raw = payload.key != null ? localStorage.getItem(STORAGE_PREFIX + payload.key) : null
            runCallback(payload.callback, scope, [null, raw])
          } catch (e) {
            runCallback(payload.callback, scope, [e, null])
          }
          break

        case 'rewardedAd':
          game && (game.paused = false)
          runCallback(payload.callback, scope, [true])
          break

        case 'playButtonPressed':
          runCallback(payload.callback, scope)
          break

        case 'social.getFriends':
          runCallback(payload.callback, scope, [null, []])
          break

        case 'getLeaderboard':
          runCallback(payload.callback, scope, [null, null])
          break

        default:
          console.debug('[ad-stub] unhandled event:', event)
          runCallback(payload.callback, scope)
      }
    },
  }
})()
