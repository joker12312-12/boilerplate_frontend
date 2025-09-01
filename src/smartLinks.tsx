import NextLink, { LinkProps } from "next/link";

export function SmartLink(props: LinkProps & React.PropsWithChildren) {
  return <NextLink prefetch={false} {...props} />;
}
