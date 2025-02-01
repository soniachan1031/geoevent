import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { v4 as uuidv4 } from "uuid";

type CustomBreadcrumbProps = {
  links: {
    href: string;
    text: string;
  }[];
  currentPage: string;
};

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  links,
  currentPage,
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {links.map((link) => (
          <Fragment key={uuidv4()}>
            <BreadcrumbItem>
              <BreadcrumbLink href={link.href}>{link.text}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CustomBreadcrumb;
