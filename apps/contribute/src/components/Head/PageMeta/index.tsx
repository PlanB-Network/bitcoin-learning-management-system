import { Helmet } from 'react-helmet-async';

import { SITE_NAME } from '#src/utils/meta.js';

interface PageMetaProps {
  title?: string;
  description?: string;
  type?: string;
  imageSrc?: string;
}

const PageMeta = ({
  title = SITE_NAME,
  description,
  type,
  imageSrc,
}: PageMetaProps) => {
  const newDescription =
    description && description.length > 200
      ? `${description
          ?.replaceAll('#', '')
          .replaceAll('*', '')
          .trim()
          .slice(0, 200)}...`
      : description;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={newDescription} />}
      {/* Facebook tags */}
      <meta property="og:site_name" content={SITE_NAME} />
      {type && <meta property="og:type" content={type} />}
      {title && <meta property="og:title" content={title} />}
      {description && (
        <meta property="og:description" content={newDescription} />
      )}
      {imageSrc && <meta property="og:image" content={imageSrc} />}
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && (
        <meta name="twitter:description" content={newDescription} />
      )}
    </Helmet>
  );
};

export default PageMeta;
