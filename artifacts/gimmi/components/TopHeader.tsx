import React from 'react';
import { Header } from '@/components/GimmiUI';

type Props = Omit<React.ComponentProps<typeof Header>, 'showBorder'>;

/** Shared iOS-sized navigation title; screens supply their own leading/trailing actions. */
export function TopHeader(props: Props) {
  return <Header {...props} showBorder={false} />;
}