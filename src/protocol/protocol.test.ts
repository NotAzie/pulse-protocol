import { describe, it, expect, vi } from 'vitest';
import { createPulseProtocol, type PulsePlugin } from './index';

describe('PulseProtocol SDK & Extensible Infrastructure', () => {
  it('initializes the protocol and dispatches lifecycle plugin hooks', async () => {
    const onInit = vi.fn();
    const onAnalysis = vi.fn();

    const mockPlugin: PulsePlugin = {
      name: 'test-telemetry-plugin',
      version: '1.0.0',
      onInitialize: onInit,
      onAnalysisComplete: onAnalysis,
    };

    const protocol = createPulseProtocol({
      appId: 'campus-analytics-enterprise',
      plugins: [mockPlugin],
    });

    await protocol.initialize();
    expect(onInit).toHaveBeenCalled();

    const result = await protocol.ingest([
      'The Wi-Fi in the library is blazing fast and reliable!',
      'Cafeteria meals are cold and expensive today.',
    ]);

    expect(onAnalysis).toHaveBeenCalled();
    expect(result.analysis).toBeDefined();
    expect(result.systemHealth.activeStrategy).toBe('BitwiseDirect');
    expect(result.agentReport).toBeDefined();
  });

  it('allows dynamic registration of custom plugins', () => {
    const protocol = createPulseProtocol({ appId: 'custom-app' });
    protocol.registerPlugin({
      name: 'slack-incident-bridge',
      version: '2.1.0',
    });

    const plugins = protocol.getPlugins();
    expect(plugins.some((p) => p.name === 'slack-incident-bridge')).toBe(true);
  });
});
