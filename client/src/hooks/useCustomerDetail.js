import { useEffect, useMemo, useState } from 'react';
import { customerApi } from '../services/api';

export function useCustomerDetail(customerId) {
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesError, setNotesError] = useState('');
  const [noteSubmitError, setNoteSubmitError] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createdByLabel = useMemo(() => {
    if (customer?.created_by_username) {
      return `${customer.created_by_username}${customer.created_by_role ? ` (${customer.created_by_role})` : ''}`;
    }

    if (customer?.created_by) {
      return `User ID ${customer.created_by}`;
    }

    return '-';
  }, [customer]);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await customerApi.getById(customerId);
        setCustomer(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không tìm thấy thông tin khách hàng');
      } finally {
        setLoading(false);
      }
    };

    const fetchNotes = async () => {
      setNotesLoading(true);
      setNotesError('');

      try {
        const res = await customerApi.getNotes(customerId);
        setNotes(res.data);
      } catch (err) {
        setNotesError(err.response?.data?.message || 'Không thể tải lịch sử chăm sóc');
      } finally {
        setNotesLoading(false);
      }
    };

    void fetchCustomer();
    void fetchNotes();
  }, [customerId]);

  const submitNote = async (content) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      const message = 'Vui lòng nhập nội dung ghi chú';
      setNoteSubmitError(message);
      return { success: false, message };
    }

    setSubmittingNote(true);
    setNoteSubmitError('');
    setNotesError('');

    try {
      const res = await customerApi.createNote(customerId, { content: trimmedContent });
      setNotes((currentNotes) => [res.data.note, ...currentNotes]);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể thêm ghi chú';
      setNoteSubmitError(message);
      return { success: false, message };
    } finally {
      setSubmittingNote(false);
    }
  };

  const clearNoteSubmitError = () => {
    if (noteSubmitError) {
      setNoteSubmitError('');
    }
  };

  const openDeleteDialog = () => setDeleteOpen(true);

  const closeDeleteDialog = () => {
    if (!deleting) {
      setDeleteOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!customer) {
      return false;
    }

    setDeleting(true);
    try {
      await customerApi.remove(customer.id);
      setDeleteOpen(false);
      return true;
    } catch (err) {
      setDeleteOpen(false);
      setError(err.response?.data?.message || 'Không thể xóa khách hàng');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    customer,
    notes,
    loading,
    notesLoading,
    error,
    notesError,
    noteSubmitError,
    submittingNote,
    deleteOpen,
    deleting,
    createdByLabel,
    submitNote,
    clearNoteSubmitError,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  };
}
