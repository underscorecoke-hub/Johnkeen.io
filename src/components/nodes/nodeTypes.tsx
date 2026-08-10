import React from 'react';
import { CustomNodeWrapper } from './CustomNodeWrapper';

export const createCustomNode = (nodeType: string) => {
  return (props: any) => <CustomNodeWrapper {...props} data={{ ...props.data, nodeType }} />;
};

export const nodeTypes = {
  trigger_telegram: createCustomNode('trigger_telegram'),
  trigger_webhook: createCustomNode('trigger_webhook'),
  data_gemini: createCustomNode('data_gemini'),
  data_1inch: createCustomNode('data_1inch'),
  web3_balancer: createCustomNode('web3_balancer'),
  web3_pimlico: createCustomNode('web3_pimlico'),
  output_telegram: createCustomNode('output_telegram'),
  output_webhook: createCustomNode('output_webhook'),
};
