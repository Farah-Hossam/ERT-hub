"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export default function Home() {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold text-brand">ERT Hub</h1>

      <div className="flex gap-3">
        <Button onClick={() => setCreateOpen(true)}>Create task</Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          Delete task
        </Button>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create task"
        closeOnBackdrop={false}
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Title" placeholder="Design the steering column" required />
          <Input label="Due date" type="date" />
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete task?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(false)}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          This can't be undone. Click outside the box or press Esc to cancel.
        </p>
      </Modal>
    </main>
  );
}