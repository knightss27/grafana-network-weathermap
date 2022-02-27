import { PanelPlugin } from '@grafana/data';
import { plugin } from './module';

// Just a stub test
describe('Network Weathermap', () => {
  it('Should be instance of PanelPlugin', () => {
    expect(plugin).toBeInstanceOf(PanelPlugin);
  });
});
