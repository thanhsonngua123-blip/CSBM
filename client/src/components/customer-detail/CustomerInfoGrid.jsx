import InfoItem from './InfoItem';
import { formatDateTime } from '../../utils/date-time';

function CustomerInfoGrid({ customer, createdByLabel }) {
  const issues = Array.isArray(customer.integrity_issues) ? customer.integrity_issues : [];
  const issueMap = {};

  for (let i = 0; i < issues.length; i = i + 1) {
    issueMap[issues[i].field] = issues[i];
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InfoItem
        label="Email"
        value={customer.email}
        highlighted={Boolean(issueMap.email)}
        hint={issueMap.email?.message || ''}
      />
      <InfoItem
        label="Số điện thoại"
        value={customer.phone}
        mono
        highlighted={Boolean(issueMap.phone)}
        hint={issueMap.phone?.message || ''}
      />
      <InfoItem
        label="CCCD / CMND"
        value={customer.id_number}
        mono
        highlighted={Boolean(issueMap.id_number)}
        hint={issueMap.id_number?.message || ''}
      />
      <InfoItem
        label="Địa chỉ"
        value={customer.address}
        highlighted={Boolean(issueMap.address)}
        hint={issueMap.address?.message || ''}
      />
      <InfoItem label="Tạo bởi" value={createdByLabel} />
      <InfoItem label="Cập nhật lần cuối" value={formatDateTime(customer.updated_at)} />
    </div>
  );
}

export default CustomerInfoGrid;
