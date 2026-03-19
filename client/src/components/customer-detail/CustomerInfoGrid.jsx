import InfoItem from './InfoItem';
import { formatDateTime } from '../../utils/date-time';

function CustomerInfoGrid({ customer, createdByLabel }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InfoItem label="Email" value={customer.email} />
      <InfoItem label="Số điện thoại" value={customer.phone} mono />
      <InfoItem label="CCCD / CMND" value={customer.id_number} mono />
      <InfoItem label="Địa chỉ" value={customer.address} />
      <InfoItem label="Tạo bởi" value={createdByLabel} />
      <InfoItem label="Cập nhật lần cuối" value={formatDateTime(customer.updated_at)} />
    </div>
  );
}

export default CustomerInfoGrid;
