import { Firestore } from 'firebase-admin/firestore'
import { TLEntry } from '../../common/transaction-log'
import { createClient } from '@supabase/supabase-js'
import { run, SupabaseClient } from '../../common/supabase/utils'

export function createSupabaseClient(url: string, key: string) {
  return createClient(url, key) as SupabaseClient
}

export async function createFailedWrites(
  firestore: Firestore,
  ...entries: TLEntry[]
) {
  const coll = firestore
    .collection('replicationState')
    .doc('supabase')
    .collection('failedWrites')
  const creator = firestore.bulkWriter({ throttling: false })
  for (const entry of entries) {
    creator.create(coll.doc(), entry)
  }
  await creator.close()
}

export async function replayFailedWrites(
  firestore: Firestore,
  supabase: SupabaseClient,
  limit = 1000
) {
  const failedWrites = await firestore
    .collection('replicationState')
    .doc('supabase')
    .collection('failedWrites')
    .limit(limit)
    .get()
  if (failedWrites.size == 0) {
    return 0
  }

  console.log(`Attempting to replay ${failedWrites.size} write(s)...`)
  const deleter = firestore.bulkWriter({ throttling: false })
  const entries = failedWrites.docs.map((d) => d.data() as TLEntry)
  await replicateWrites(supabase, ...entries)
  for (const doc of failedWrites.docs) {
    deleter.delete(doc.ref)
  }
  await deleter.close()
  console.log(`Successfully replayed ${failedWrites.size} write(s).`)
  return failedWrites.size
}

export async function replicateWrites(
  supabase: SupabaseClient,
  ...entries: TLEntry[]
) {
  return await run(
    supabase.from('incoming_writes').insert(
      entries.map((e) => ({
        event_id: e.eventId,
        doc_kind: e.docKind,
        write_kind: e.writeKind,
        doc_id: e.docId,
        data: e.data,
        ts: new Date(e.ts).toISOString(),
      }))
    )
  )
}