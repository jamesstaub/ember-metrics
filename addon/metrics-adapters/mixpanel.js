import { assign } from '@ember/polyfills';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import canUseDOM from '../utils/can-use-dom';
import objectTransforms from '../utils/object-transforms';
import removeFromDOM from '../utils/remove-from-dom';
import BaseAdapter from './base';
import mixpanel from 'mixpanel-browser';

const {
  without,
  compact,
  isPresent
} = objectTransforms;

export default BaseAdapter.extend({
  toStringExtension() {
    return 'Mixpanel';
  },

  init() {
    const config = get(this, 'config');
    const { token, api_host = "https://api.mixpanel.com"} = config;
    assert(`[ember-metrics] You must pass a valid \`token\` to the ${this.toString()} adapter`, token);
    mixpanel.init(token, { "api_host": api_host, "secure_cookie": true });
  },

  identify(options = {}) {
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;
    const props = without(compactedOptions, 'distinctId');

    if (isPresent(props) && canUseDOM) {
      window.mixpanel.identify(distinctId);
      window.mixpanel.people.set(props);
    } else if (canUseDOM) {
      window.mixpanel.identify(distinctId);
    }
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const { event } = compactedOptions;
    const props = without(compactedOptions, 'event');

    if (isPresent(props) && canUseDOM) {
      window.mixpanel.track(event, props);
    } else if (canUseDOM) {
      window.mixpanel.track(event);
    }
  },

  trackPage(options = {}) {
    const event = { event: 'page viewed' };
    const mergedOptions = assign(event, options);

    this.trackEvent(mergedOptions);
  },

  alias(options = {}) {
    const compactedOptions = compact(options);
    const { alias, original } = compactedOptions;

    if (original && canUseDOM) {
      window.mixpanel.alias(alias, original);
    } else if (canUseDOM) {
      window.mixpanel.alias(alias);
    }
  },

  willDestroy() {
    if (!canUseDOM) { return; }
    removeFromDOM('script[src*="mixpanel"]');

    delete window.mixpanel;
  }
});
