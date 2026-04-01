'use client';

import React, { useState, useMemo } from 'react';
import { Typography, Card, Switch, InputNumber, Space, Button, Divider, message } from 'antd';
import { ControlOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface GenSettings {
  retakeEnabled: boolean;
  actionVideoEnabled: boolean;
  actionVideoCount: number;
  mvVideoEnabled: boolean;
  mvVideoCount: number;
}

const DEFAULTS: GenSettings = {
  retakeEnabled: true,
  actionVideoEnabled: false,
  actionVideoCount: 1,
  mvVideoEnabled: false,
  mvVideoCount: 1,
};

export default function GenerationControlPage() {
  const [saved, setSaved] = useState<GenSettings>(DEFAULTS);
  const [current, setCurrent] = useState<GenSettings>(DEFAULTS);

  const isDirty = useMemo(
    () => JSON.stringify(current) !== JSON.stringify(saved),
    [current, saved]
  );

  const update = (patch: Partial<GenSettings>) =>
    setCurrent((prev) => ({ ...prev, ...patch }));

  const handleSave = () => {
    setSaved(current);
    message.success('Generation control settings saved (simulated)');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ControlOutlined style={{ marginRight: 8 }} />
          Generation Control
        </Title>
        {isDirty && (
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Save Settings
          </Button>
        )}
      </div>

      <Card>
        {/* Control 1: Retake after generation */}
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text strong>Skip Retake After Generation</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                After the user clicks Generate and returns to the result screen, controls whether they need to retake a photo.
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ON — skip retake (proceed directly); &nbsp;OFF — require retake
                </Text>
              </Text>
            </div>
            <Switch
              checked={current.retakeEnabled}
              onChange={(v) => update({ retakeEnabled: v })}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              style={{ flexShrink: 0, marginLeft: 24 }}
            />
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Control 2: Action video */}
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Text strong>Generate Action Videos</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Controls whether action videos are generated per session.
              </Text>
              {current.actionVideoEnabled && (
                <div style={{ marginTop: 12 }}>
                  <Space align="center">
                    <Text>Number of action videos:</Text>
                    <InputNumber
                      min={1}
                      max={10}
                      value={current.actionVideoCount}
                      onChange={(v) => update({ actionVideoCount: v ?? 1 })}
                      style={{ width: 80 }}
                    />
                  </Space>
                </div>
              )}
            </div>
            <Switch
              checked={current.actionVideoEnabled}
              onChange={(v) => update({ actionVideoEnabled: v })}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              style={{ flexShrink: 0, marginLeft: 24 }}
            />
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Control 3: MV video */}
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Text strong>Generate MV Videos</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Controls whether MV (music video) clips are generated per session.
              </Text>
              {current.mvVideoEnabled && (
                <div style={{ marginTop: 12 }}>
                  <Space align="center">
                    <Text>Number of MV videos:</Text>
                    <InputNumber
                      min={1}
                      max={10}
                      value={current.mvVideoCount}
                      onChange={(v) => update({ mvVideoCount: v ?? 1 })}
                      style={{ width: 80 }}
                    />
                  </Space>
                </div>
              )}
            </div>
            <Switch
              checked={current.mvVideoEnabled}
              onChange={(v) => update({ mvVideoEnabled: v })}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              style={{ flexShrink: 0, marginLeft: 24 }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
