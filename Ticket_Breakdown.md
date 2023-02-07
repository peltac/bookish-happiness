# Ticket Breakdown
We are a staffing company whose primary purpose is to book Agents at Shifts posted by Facilities on our platform. We're working on a new feature which will generate reports for our client Facilities containing info on how many hours each Agent worked in a given quarter by summing up every Shift they worked. Currently, this is how the process works:

- Data is saved in the database in the Facilities, Agents, and Shifts tables
- A function `getShiftsByFacility` is called with the Facility's id, returning all Shifts worked that quarter, including some metadata about the Agent assigned to each
- A function `generateReport` is then called with the list of Shifts. It converts them into a PDF which can be submitted by the Facility for compliance.

## You've been asked to work on a ticket. It reads:

**Currently, the id of each Agent on the reports we generate is their internal database id. We'd like to add the ability for Facilities to save their own custom ids for each Agent they work with and use that id when generating reports for them.**


Based on the information given, break this ticket down into 2-5 individual tickets to perform. Provide as much detail for each ticket as you can, including acceptance criteria, time/effort estimates, and implementation details. Feel free to make informed guesses about any unknown details - you can't guess "wrong".


You will be graded on the level of detail in each ticket, the clarity of the execution plan within and between tickets, and the intelligibility of your language. You don't need to be a native English speaker, but please proof-read your work.

## Your Breakdown Here

Assumptions:
 * The same agent can work at multiple facilities, each of which may have a different alias ID for the agent.
 * An agent's facility alias is facility-wide. That is: all reports generated from the same facility will use the same alias for the agent. If a facility has multiple users generating reports, they agree on what alias to refer to a given agent by.
 * An agent's facility alias is unique within the facility. No facility can give two of their agents the same alias at the same time.
 * An agent's facility alias is optional and mutable. It can be created, modified, and deleted at any time with no regard to the integrity of the reporting mechanism.
 * All facility users capable of generating a facility report can also change the alias for any of their agents. There is no complex permissions system surrounding how different users within a facility can rename an agent.
 * Agent aliases are free-form text fields--like a user's name or description. In theory, they could be integers or UUIDs, but we will not take advantage of any database performance optimizations specific to those database field types.
 * Agents' unique IDs are not secret. Aliases are not a mechanism to obscure that facilities share agents. Reports will continue to refer to agents by their unique IDs in addition to aliases--because we assume that aliases can change between reports and unique IDs cannot.


### `T1`: Ticket Breakdown Master Task

**Depends on:** `T2`, `T3`, `T4`, `T5`

This master task describes the overall process of adding facility-specific custom IDs--which we will refer to as **aliases**--into the staffing system.

Broadly:
1. We will create a new database table representing the alias relationship.
2. We will create REST endpoints to allow the frontend and the reporting mechanism to view and manipulate aliases.
3. We will modify the frontend and reporting system to make use of the aliases.

### `T2`: Create `AgentAlias` database table

Create a new database table called `AgentAlias` that maps custom `Facility`-provided aliases for each `Agent`.

The `AgentAlias` table schema should look like:
| Name | Type | Constraints |  |  |
|---|---|---|---|---|
| `agent_id` | `ForeignKey(Agent.id)` | `ON DELETE CASCADE` |  |  |
| `facility_id` | `ForeignKey(Facility.id)` | `ON DELETE CASCADE` |  |  |
| `alias` | `TEXT` |  |  |  |

The `AgentAlias` table should also have the following database constraints:
* `UNIQUE (agent_id, facility_id)` -- This ensures that a facility can only give one alias to an agent.
* `UNIQUE (facility_id, alias)` -- This ensures that aliases are unique within facility.

We will also want to create indexes for all three columns to enable efficient querying by aliases, unless the `AgentAlias` table is small enough that the occasional full-table scan is not a problem.

### `T3`: Create (and alter) REST endpoints for managing agent aliases

**Depends on:** `T2`

This ticket can optionally be broken into smaller tickets for each endpoint.

The following endpoints require authentication by a specific facility's user. They can only query for agents and aliases that have already been affiliated with their facility. Information about other facilities and their aliases should not be accessible.

We want to create (or modify) the following REST endpoints for manipulating agent aliases:


**POST /agent-alias**

This endpoint requires the authentication token of a given facility's user account. This endpoint allows specifying the global ID for an agent and the text alias to use instead.

This endpoint can return the following HTTP status codes:
* `202 Accepted` -- The alias was successfully created.
* `401 Unauthorized` -- The facility did not properly authenticate themselves.
* `404 Not Found` -- The facility or the agent was not found.
* `409 Conflict` -- There is another agent with the same alias in the same facility.
* `422 Unprocessable Entity` -- There is already an agent in the facility with an alias.


**PATCH /agent-alias/{agent-id}**

This endpoint modifies an agent's alias. It takes a new alias as a field.

To avoid TOCTTOU errors, we will require that modifying or deleting an agent's alias can only be done by referencing the agent's global ID.

This endpoint can return the following HTTP status codes:
* `202 Accepted` -- The alias was successfully modified.
* `401 Unauthorized` -- The facility did not properly authenticate themselves.
* `404 Not Found` -- The facility or the agent was not found.
* `409 Conflict` -- There is another agent with the same alias in the same facility.
* `422 Unprocessable Entity` -- There is already an agent in the facility with an alias.


**DELETE /agent-alias/{agent-id}**

This endpoint deletes an agent's alias.

To avoid TOCTTOU errors, we will require that modifying or deleting an agent's alias can only be done by referencing the agent's global ID.

This endpoint can return the following HTTP status codes:
* `202 Accepted` -- The alias was successfully deleted, or did not exist in the first place.
* `401 Unauthorized` -- The facility did not properly authenticate themselves.


**GET /agent-alias/{agent-id}**

This is an endpoint to fetch an agent alias by its unique ID. It exists largely for compatibility with REST conventions. The typical user would likely prefer using the more fully-featured endpoints below.

This endpoint can return the following HTTP status codes:
* `200 OK` -- The agent's permanent ID and alias are returned.
* `204 No Content` -- The agent exists and belongs to the facility, but there is no alias assigned.
* `401 Unauthorized` -- The facility did not properly authenticate themselves.
* `404 Not Found` -- The agent was not found.

**GET /agent/{agent-id}**

This is an endpoint to fetch an agent by its unique ID. This endpoint should now return an additional field showing the facility-specific alias, based on the authenticated facility that made the API call.

This endpoint can return the following HTTP status codes:
* `200 OK` -- The agent's alias and other metadata are returned.
* `401 Unauthorized` -- The facility did not properly authenticate themselves.
* `404 Not Found` -- The agent was not found.

**GET /agent?alias=**

Presumably, there is already a GET endpoint for fetching agents by ID. We should modify this endpoint with a query parameter that searches for an agent by alias--within the scope of the facility that the user belongs to.

### `T4`: Integrate agent aliases into reporting mechanism

**Depends on:** `T2`, `T3`

Our reporting mechanism might depend on the REST APIs that we created in `T3`. Or the reporting mechanism might be built directly on top of the database.

Either way, we need to alter all reports to include agents' unique IDs and their corresponding alias (if they have one).

### `T5`: Create web interface for managing agent aliases

**Depends on:** `T2`, `T3`, `T4`

The facilities must already have some web user interface for managing their agents. We must modify these user interfaces to expose the functionality of our REST API (see `T3`). We want the facility to be able to:

 * Create, Read, Update, and Delete (CRUD) aliases for agents affiliated with their facility.
 * Search for agents by alias.
 * Generate reports that refer to agents by both their alias and by the agents' unique IDs.