import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { nanoid, customAlphabet } from 'nanoid'
import { relations } from 'drizzle-orm'

const random_key = customAlphabet('23456789ABCDEFGHJKMNPQRSTUVWXYZ')

/**
 * Organization activity types
 * @description Available activities for organizations in Star Citizen
 */
export const ORGANIZATION_ACTIVITIES = [
  'VERSATILE',
  'BOUNTY_HUNTING',
  'DATA_RUNNING',
  'ENGINEERING',
  'EXPLORATION',
  'FREELANCING',
  'MEDICAL',
  'PIRACY',
  'POLITICS',
  'MILITARY',
  'INDUSTRIAL',
  'MINING',
  'SALVAGING',
  'REFINING',
  'SCOUTING',
  'SECURITY',
  'SMUGGLING',
  'TERRORISM',
  'TRADING',
  'TRANSPORT',
  'RACING',
  'ESCORT',
  'RESEARCH',
  'MERCENARY',
  'STEALTH_OPS',
  'PATROL',
  'SEARCH_AND_RESCUE',
  'CARGO_HAULING',
  'FARMING',
  'FUEL_REFUELING',
  'REPAIR',
  'INFILTRATION',
  'DIPLOMACY',
  'OTHER'
] as const

/**
 * EXTEND User Primary Gameplay (same as Organization Activities)
 * @description Available activities for player in Star Citizen
 */
const USER_PRIMARY_GAMEPLAY = ORGANIZATION_ACTIVITIES

export type OrganizationActivity = (typeof ORGANIZATION_ACTIVITIES)[number]

/**
 * Server table
 * @description Stores basic server information and configuration data, health checks, and performance metrics.
 */
export const server = sqliteTable('server', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .notNull()
    .$defaultFn(() => nanoid(32)),

  version: text('version')
    .notNull()
    .$default(() => '1.0.0'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true)
})

/**
 * Users table
 * @description Stores basic user account information, Discord authentication, and profile data
 */
export const users = sqliteTable('users', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(32)),

  // Organization membership
  org_id: text('org_id').references(() => organizations.id, {
    onDelete: 'set null'
  }),
  role_key: text('role_key').references(() => roles.key, {
    onDelete: 'set null'
  }),

  // Discord authentication
  discord_id: text('discord_id').notNull().unique(),
  discord_username: text('discord_username'),
  discord_avatar: text('discord_avatar'),
  discord_refresh_token: text('discord_refresh_token'),

  // User profile
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  display_name: text('display_name'),
  bio: text('bio'),
  locale: text('locale').default('en'),
  primary_gameplay: text('primary_gameplay', {
    enum: USER_PRIMARY_GAMEPLAY
  }),

  // Star Citizen profile
  sc_handle: text('sc_handle').unique(),
  sc_handle_verified: integer('sc_handle_verified', { mode: 'boolean' }).notNull().default(false),
  sc_handle_verify_attempts: integer('sc_handle_verify_attempts').notNull().default(0),

  // Timestamps
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  last_login_at: integer('last_login_at', { mode: 'timestamp' }),
  logged_in: integer('logged_in', { mode: 'boolean' }).notNull().default(false),

  // Organization membership details
  is_org_admin: integer('is_org_admin', { mode: 'boolean' }).notNull().default(false),
  joined_org_at: integer('joined_org_at', { mode: 'timestamp' }),
  invited_by_user_id: text('invited_by_user_id').references((): any => users.id, {
    onDelete: 'set null'
  }),
  org_authorization_level: text('org_authorization_level', {
    enum: ['NORMAL', 'MODERATOR', 'ADMIN', 'OWNER']
  }).default('NORMAL'),

  // Security and API access
  regen_key: text('regen_key')
    .notNull()
    .$defaultFn(() => random_key(8)),
  udx_install_token: text('udx_install_token')
    .notNull()
    .$defaultFn(() => `UDX-${random_key(28)}`),
  api_secret_key: text('api_secret_key')
    .notNull()
    .$defaultFn(() => random_key(64)),

  // Twitch extension
  twitch_extension_key: text('twitch_extension_key')
    .notNull()
    .$defaultFn(() => random_key(32)),
  twitch_extension_active: integer('twitch_extension_active', {
    mode: 'boolean'
  })
    .notNull()
    .default(false),

  // Account moderation
  is_banned: integer('is_banned', { mode: 'boolean' }).notNull().default(false),
  ban_reason: text('ban_reason'),
  banned_at: integer('banned_at', { mode: 'timestamp' }),
  banned_until: integer('banned_until', { mode: 'timestamp' }),
  banned_by_user_id: text('banned_by_user_id'),
  flag_status: integer('flag_status').notNull().default(0),

  // Account verification
  email_verified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  email_verified_at: integer('email_verified_at', { mode: 'timestamp' })
})

/**
 * Organizations table
 * @description Stores star citizen organization information
 */
export const organizations = sqliteTable('organizations', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(32)),

  // Owner information
  owner_id: text('owner_id')
    .notNull()
    .references((): any => users.id, { onDelete: 'restrict' }),

  // Basic information
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  tagline: text('tagline'),
  website: text('website'),

  // Statistics
  member_count: integer('member_count').notNull().default(0),
  ship_count: integer('ship_count').notNull().default(0),
  build_count: integer('build_count').notNull().default(0),
  event_count: integer('event_count').notNull().default(0),

  // Settings
  is_public: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  is_fully_setup: integer('is_fully_setup', { mode: 'boolean' }).notNull().default(false),
  is_premium: integer('is_premium', { mode: 'boolean' }).notNull().default(false),
  is_verified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),

  // Invitations
  invitations_enabled: integer('invitations_enabled', { mode: 'boolean' }).notNull().default(false),
  invitation_bridge_number: text('invitation_bridge_number'),
  max_invitations: integer('max_invitations').notNull().default(10),

  // Media
  has_banner: integer('has_banner', { mode: 'boolean' }).notNull().default(false),
  has_logo: integer('has_logo', { mode: 'boolean' }).notNull().default(false),
  banner_url: text('banner_url'),
  logo_url: text('logo_url'),

  // Metadata
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
})

/**
 * Discovery table
 * @description Organization discovery and search settings
 */
export const discovery = sqliteTable('discovery', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(32)),
  org_id: text('org_id')
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  // Discovery settings
  language: text('language').default('en'),
  primary_starcitizen_server_zone: text('primary_starcitizen_server_zone', {
    enum: ['US', 'EU', 'OCE']
  }),
  is_roleplay: integer('is_roleplay', { mode: 'boolean' }).notNull().default(false),
  is_hardcore: integer('is_hardcore', { mode: 'boolean' }).notNull().default(false),
  is_recruiting: integer('is_recruiting', { mode: 'boolean' }).notNull().default(true),
  min_age_requirement: integer('min_age_requirement'),

  // Organization focus
  // For me and for simplicity, we limit to one primary activity and multiple secondary activities
  // If you have more activities in mind, please open an issue or PR, or contact me on Discord (see README)
  primary_activity: text('primary_activity', {
    enum: ORGANIZATION_ACTIVITIES
  }),
  secondary_activities: text('secondary_activities', { mode: 'json' }).$type<
    OrganizationActivity[]
  >(),

  // Visibility
  listed_in_discovery: integer('listed_in_discovery', { mode: 'boolean' }).notNull().default(true),

  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
})

/**
 * Roles table
 * @description User roles within organizations
 */
export const roles = sqliteTable('roles', {
  key: text('key').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  background_color: text('background_color'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})

/**
 * Ships table
 * @description Star Citizen ships
 */
export const ships = sqliteTable('ships', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(32)),

  // Basic information
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  manufacturer: text('manufacturer').notNull(),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  model_3d_available: integer('model_3d_available', { mode: 'boolean' }).notNull().default(false),

  // Classification
  size: text('size', {
    enum: ['vehicle', 'snub', 'small', 'medium', 'large', 'capital']
  }),
  role: text('role'),
  focus: text('focus'),

  // Specifications
  crew_min: integer('crew_min'),
  crew_max: integer('crew_max'),
  cargo_capacity: integer('cargo_capacity'),
  price_uec: integer('price_uec'),
  price_usd: integer('price_usd'),

  // Status
  production_status: text('production_status', {
    enum: ['flight_ready', 'in_development', 'concept', 'announced']
  }),
  is_loaner: integer('is_loaner', { mode: 'boolean' }).notNull().default(false),

  // Media
  image_url: text('image_url'),
  thumbnail_url: text('thumbnail_url'),

  // Metadata
  wiki_url: text('wiki_url'),
  store_url: text('store_url'),

  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
})

/**
 * Ownership table
 * @description User-owned ships
 */
export const user_ownership = sqliteTable('user_ownership', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Relations
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ship_id: text('ship_id')
    .notNull()
    .references(() => ships.id, { onDelete: 'cascade' }),

  // Ship details (denormalized for performance)
  ship_name: text('ship_name').notNull(),
  ship_slug: text('ship_slug').notNull(),

  // Ownership details
  ship_nickname: text('ship_nickname'),
  is_favorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),

  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
})

/**
 * Organization ownership table
 * @description Ships owned by organizations
 */
export const org_ownership = sqliteTable('org_ownership', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Relations
  org_id: text('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  contributed_by_user_id: text('contributed_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ship_id: text('ship_id')
    .notNull()
    .references(() => ships.id, { onDelete: 'cascade' }),

  // Ship details (denormalized for performance)
  ship_name: text('ship_name').notNull(),
  ship_slug: text('ship_slug').notNull(),

  // Quantity and details
  quantity: integer('quantity').notNull().default(1),
  is_available: integer('is_available', { mode: 'boolean' }).notNull().default(true),

  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
})

/**
 * Builds table
 * @description Ship loadout configurations
 */
export const builds = sqliteTable('builds', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(32)),

  // Relations
  creator_id: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  org_id: text('org_id').references(() => organizations.id, {
    onDelete: 'set null'
  }),
  ship_id: text('ship_id')
    .notNull()
    .references(() => ships.id, { onDelete: 'cascade' }),

  // Build information
  title: text('title').notNull(),
  description: text('description'),
  build_data: text('build_data', { mode: 'json' }),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),

  // Game version
  game_version: text('game_version'),
  is_outdated: integer('is_outdated', { mode: 'boolean' }).notNull().default(false),

  // Statistics
  like_count: integer('like_count').notNull().default(0),
  favorite_count: integer('favorite_count').notNull().default(0),
  view_count: integer('view_count').notNull().default(0),
  fork_count: integer('fork_count').notNull().default(0),

  // Forking
  forked_from_id: text('forked_from_id').references((): any => builds.id, {
    onDelete: 'set null'
  }),

  // Visibility
  is_public: integer('is_public', { mode: 'boolean' }).notNull().default(true),
  is_featured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  is_template: integer('is_template', { mode: 'boolean' }).notNull().default(false),

  // Metadata
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
})

/**
 * Build likes table
 * @description Tracks user likes on builds
 */
export const build_likes = sqliteTable('build_likes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(32)),
  build_id: text('build_id')
    .notNull()
    .references(() => builds.id, { onDelete: 'cascade' }),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})

/**
 * Build favorites table
 * @description Tracks user favorites on builds
 */
export const build_favorites = sqliteTable('build_favorites', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(32)),
  build_id: text('build_id')
    .notNull()
    .references(() => builds.id, { onDelete: 'cascade' }),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})

/**
 * Invitations table
 * @description Organization invitation codes
 */
export const invitations = sqliteTable('invitations', {
  // Primary identifier
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(32)),
  code: text('code')
    .notNull()
    .unique()
    .$defaultFn(() => random_key(12)),

  // Relations
  org_id: text('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  created_by_user_id: text('created_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Usage limits
  max_uses: integer('max_uses').notNull().default(1),
  current_uses: integer('current_uses').notNull().default(0),

  // Validity
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  expires_at: integer('expires_at', { mode: 'timestamp' }),

  // Metadata
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
})

/**
 * RELATIONS
 * @description Define relations between tables for easier joins and queries
 */
export const users_relations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.org_id],
    references: [organizations.id]
  }),
  role: one(roles, {
    fields: [users.role_key],
    references: [roles.key]
  }),
  invited_by: one(users, {
    fields: [users.invited_by_user_id],
    references: [users.id],
    relationName: 'inviter'
  }),
  invited_users: many(users, { relationName: 'inviter' }),
  owned_ships: many(user_ownership),
  contributed_ships: many(org_ownership),
  created_builds: many(builds),
  liked_builds: many(build_likes),
  favorite_builds: many(build_favorites),
  created_invitations: many(invitations)
}))

export const organizations_relations = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.owner_id],
    references: [users.id]
  }),
  members: many(users),
  discovery: one(discovery, {
    fields: [organizations.id],
    references: [discovery.org_id]
  }),
  fleet: many(org_ownership),
  builds: many(builds),
  invitations: many(invitations)
}))

export const discovery_relations = relations(discovery, ({ one }) => ({
  organization: one(organizations, {
    fields: [discovery.org_id],
    references: [organizations.id]
  })
}))

export const roles_relations = relations(roles, ({ many }) => ({
  users: many(users)
}))

export const ships_relations = relations(ships, ({ many }) => ({
  ownerships: many(user_ownership),
  org_ownerships: many(org_ownership),
  builds: many(builds)
}))

export const ownership_relations = relations(user_ownership, ({ one }) => ({
  user: one(users, {
    fields: [user_ownership.user_id],
    references: [users.id]
  }),
  ship: one(ships, {
    fields: [user_ownership.ship_id],
    references: [ships.id]
  })
}))

export const org_ownership_relations = relations(org_ownership, ({ one }) => ({
  organization: one(organizations, {
    fields: [org_ownership.org_id],
    references: [organizations.id]
  }),
  contributor: one(users, {
    fields: [org_ownership.contributed_by_user_id],
    references: [users.id]
  }),
  ship: one(ships, {
    fields: [org_ownership.ship_id],
    references: [ships.id]
  })
}))

export const builds_relations = relations(builds, ({ one, many }) => ({
  creator: one(users, {
    fields: [builds.creator_id],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [builds.org_id],
    references: [organizations.id]
  }),
  ship: one(ships, {
    fields: [builds.ship_id],
    references: [ships.id]
  }),
  forked_from: one(builds, {
    fields: [builds.forked_from_id],
    references: [builds.id],
    relationName: 'fork_parent'
  }),
  forks: many(builds, { relationName: 'fork_parent' }),
  likes: many(build_likes),
  favorites: many(build_favorites)
}))

export const build_likes_relations = relations(build_likes, ({ one }) => ({
  build: one(builds, {
    fields: [build_likes.build_id],
    references: [builds.id]
  }),
  user: one(users, {
    fields: [build_likes.user_id],
    references: [users.id]
  })
}))

export const build_favorites_relations = relations(build_favorites, ({ one }) => ({
  build: one(builds, {
    fields: [build_favorites.build_id],
    references: [builds.id]
  }),
  user: one(users, {
    fields: [build_favorites.user_id],
    references: [users.id]
  })
}))

export const invitations_relations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.org_id],
    references: [organizations.id]
  }),
  creator: one(users, {
    fields: [invitations.created_by_user_id],
    references: [users.id]
  })
}))

/**
 * TYPES
 * @description Infer types from tables for type safety
 */
export type Server = typeof server.$inferSelect
export type NewServer = typeof server.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert

export type Discovery = typeof discovery.$inferSelect
export type NewDiscovery = typeof discovery.$inferInsert

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert

export type Ship = typeof ships.$inferSelect
export type NewShip = typeof ships.$inferInsert

export type UserOwnership = typeof user_ownership.$inferSelect
export type NewUserOwnership = typeof user_ownership.$inferInsert

export type OrgOwnership = typeof org_ownership.$inferSelect
export type NewOrgOwnership = typeof org_ownership.$inferInsert

export type Build = typeof builds.$inferSelect
export type NewBuild = typeof builds.$inferInsert

export type BuildLike = typeof build_likes.$inferSelect
export type NewBuildLike = typeof build_likes.$inferInsert

export type BuildFavorite = typeof build_favorites.$inferSelect
export type NewBuildFavorite = typeof build_favorites.$inferInsert

export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
