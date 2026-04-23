
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.NewsletterSubscriberScalarFieldEnum = {
  id: 'id',
  email: 'email',
  createdAt: 'createdAt',
  source: 'source',
  consent: 'consent',
  name: 'name',
  tags: 'tags'
};

exports.Prisma.ContactMessageScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  message: 'message',
  createdAt: 'createdAt',
  read: 'read'
};

exports.Prisma.BlogPostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  body: 'body',
  coverImage: 'coverImage',
  author: 'author',
  category: 'category',
  published: 'published',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamMemberScalarFieldEnum = {
  id: 'id',
  name: 'name',
  bioDe: 'bioDe',
  bioEn: 'bioEn',
  bioFr: 'bioFr',
  linkedin: 'linkedin',
  imageUrl: 'imageUrl'
};

exports.Prisma.MediaScalarFieldEnum = {
  id: 'id',
  filename: 'filename',
  url: 'url',
  altText: 'altText',
  category: 'category',
  size: 'size',
  mimeType: 'mimeType',
  createdAt: 'createdAt'
};

exports.Prisma.VenueScalarFieldEnum = {
  id: 'id',
  name: 'name',
  addressLine1: 'addressLine1',
  postalCode: 'postalCode',
  city: 'city',
  country: 'country',
  googleMapsUrl: 'googleMapsUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VenueTranslationScalarFieldEnum = {
  id: 'id',
  venueId: 'venueId',
  locale: 'locale',
  displayName: 'displayName',
  addressLabel: 'addressLabel',
  cityLabel: 'cityLabel',
  shortDescription: 'shortDescription'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  year: 'year',
  slug: 'slug',
  status: 'status',
  sortOrder: 'sortOrder',
  startsAt: 'startsAt',
  endsAt: 'endsAt',
  timezone: 'timezone',
  isDateConfirmed: 'isDateConfirmed',
  heroImageUrl: 'heroImageUrl',
  heroBadge: 'heroBadge',
  primaryCtaUrl: 'primaryCtaUrl',
  secondaryCtaUrl: 'secondaryCtaUrl',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  contactInstagram: 'contactInstagram',
  showPrice: 'showPrice',
  priceBlurred: 'priceBlurred',
  ticketingStatus: 'ticketingStatus',
  publishedAt: 'publishedAt',
  venueId: 'venueId',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventTranslationScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  locale: 'locale',
  name: 'name',
  title: 'title',
  subtitle: 'subtitle',
  shortDescription: 'shortDescription',
  longDescription: 'longDescription',
  heroText: 'heroText',
  audienceLabel: 'audienceLabel',
  badgeText: 'badgeText',
  primaryCtaLabel: 'primaryCtaLabel',
  secondaryCtaLabel: 'secondaryCtaLabel',
  galleryIntro: 'galleryIntro',
  ticketInfo: 'ticketInfo',
  pdfTitle: 'pdfTitle',
  pdfDescription: 'pdfDescription',
  seoTitle: 'seoTitle',
  seoDescription: 'seoDescription',
  dateFallbackLabel: 'dateFallbackLabel',
  dateTbaLabel: 'dateTbaLabel'
};

exports.Prisma.EventPriceScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  type: 'type',
  priceCents: 'priceCents',
  currency: 'currency',
  purchaseUrl: 'purchaseUrl',
  sortOrder: 'sortOrder',
  isVisible: 'isVisible',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventHighlightScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  sortOrder: 'sortOrder',
  isVisible: 'isVisible',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventHighlightTranslationScalarFieldEnum = {
  id: 'id',
  eventHighlightId: 'eventHighlightId',
  locale: 'locale',
  title: 'title',
  body: 'body'
};

exports.Prisma.EventPriceTranslationScalarFieldEnum = {
  id: 'id',
  eventPriceId: 'eventPriceId',
  locale: 'locale',
  label: 'label',
  infoText: 'infoText'
};

exports.Prisma.ScheduleSectionScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ScheduleSectionTranslationScalarFieldEnum = {
  id: 'id',
  scheduleSectionId: 'scheduleSectionId',
  locale: 'locale',
  title: 'title',
  subtitle: 'subtitle'
};

exports.Prisma.ScheduleItemScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  sectionId: 'sectionId',
  startTime: 'startTime',
  endTime: 'endTime',
  sessionType: 'sessionType',
  room: 'room',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ScheduleItemTranslationScalarFieldEnum = {
  id: 'id',
  scheduleItemId: 'scheduleItemId',
  locale: 'locale',
  title: 'title',
  subtitle: 'subtitle',
  description: 'description'
};

exports.Prisma.SpeakerScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  firstName: 'firstName',
  lastName: 'lastName',
  displayName: 'displayName',
  photoUrl: 'photoUrl',
  linkedInUrl: 'linkedInUrl',
  instagramUrl: 'instagramUrl',
  websiteUrl: 'websiteUrl',
  sortOrder: 'sortOrder',
  isVisible: 'isVisible',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SpeakerTranslationScalarFieldEnum = {
  id: 'id',
  speakerId: 'speakerId',
  locale: 'locale',
  role: 'role',
  organization: 'organization',
  shortBio: 'shortBio',
  longBio: 'longBio'
};

exports.Prisma.EventSpeakerScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  speakerId: 'speakerId',
  sortOrder: 'sortOrder',
  isVisible: 'isVisible',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ScheduleItemSpeakerScalarFieldEnum = {
  id: 'id',
  scheduleItemId: 'scheduleItemId',
  speakerId: 'speakerId',
  sortOrder: 'sortOrder'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  category: 'category',
  logoUrl: 'logoUrl',
  websiteUrl: 'websiteUrl',
  sortOrder: 'sortOrder',
  isVisible: 'isVisible',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationTranslationScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  locale: 'locale',
  shortDescription: 'shortDescription'
};

exports.Prisma.EventOrganizationScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  organizationId: 'organizationId',
  category: 'category',
  sortOrder: 'sortOrder',
  isVisible: 'isVisible',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventMediaScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  type: 'type',
  url: 'url',
  mimeType: 'mimeType',
  size: 'size',
  width: 'width',
  height: 'height',
  sortOrder: 'sortOrder',
  isVisible: 'isVisible',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventMediaTranslationScalarFieldEnum = {
  id: 'id',
  eventMediaId: 'eventMediaId',
  locale: 'locale',
  altText: 'altText',
  caption: 'caption'
};

exports.Prisma.EventDocumentScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  type: 'type',
  url: 'url',
  sortOrder: 'sortOrder',
  isVisible: 'isVisible',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventDocumentTranslationScalarFieldEnum = {
  id: 'id',
  eventDocumentId: 'eventDocumentId',
  locale: 'locale',
  title: 'title',
  description: 'description'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  NewsletterSubscriber: 'NewsletterSubscriber',
  ContactMessage: 'ContactMessage',
  BlogPost: 'BlogPost',
  TeamMember: 'TeamMember',
  Media: 'Media',
  Venue: 'Venue',
  VenueTranslation: 'VenueTranslation',
  Event: 'Event',
  EventTranslation: 'EventTranslation',
  EventPrice: 'EventPrice',
  EventHighlight: 'EventHighlight',
  EventHighlightTranslation: 'EventHighlightTranslation',
  EventPriceTranslation: 'EventPriceTranslation',
  ScheduleSection: 'ScheduleSection',
  ScheduleSectionTranslation: 'ScheduleSectionTranslation',
  ScheduleItem: 'ScheduleItem',
  ScheduleItemTranslation: 'ScheduleItemTranslation',
  Speaker: 'Speaker',
  SpeakerTranslation: 'SpeakerTranslation',
  EventSpeaker: 'EventSpeaker',
  ScheduleItemSpeaker: 'ScheduleItemSpeaker',
  Organization: 'Organization',
  OrganizationTranslation: 'OrganizationTranslation',
  EventOrganization: 'EventOrganization',
  EventMedia: 'EventMedia',
  EventMediaTranslation: 'EventMediaTranslation',
  EventDocument: 'EventDocument',
  EventDocumentTranslation: 'EventDocumentTranslation'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
