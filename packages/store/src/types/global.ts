export type LinkLikeProps = {
  href?: string;
  className?: string;
  children?: React.ReactNode;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler;
};
export type LinkLike = React.ComponentType<LinkLikeProps>;
