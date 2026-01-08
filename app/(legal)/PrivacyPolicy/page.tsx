"use client";

export default function PrivacyPolicy() {
  const policies = [
    {
      title: '1. Phạm vi áp dụng',
      content: [
        'Chính sách này áp dụng cho:',
        '•\tNgười dùng cá nhân sử dụng Smart Locker',
        '•\tNgười dùng đăng ký tài khoản trên dashboard',
        '•\tShipper (nếu có quyền truy cập hạn chế)',
        '•\tQuản trị viên/đơn vị vận hành hệ thống',
      ],
    },
    {
      title: '2. Định nghĩa',
      content: [
        '•\tDữ liệu cá nhân: Thông tin có thể dùng để nhận dạng một cá nhân trực tiếp hoặc gián tiếp',
        '•\tNgười dùng: Cá nhân hoặc tổ chức sử dụng Dịch vụ VLocker',
        '•\tXử lý dữ liệu: Thu thập, lưu trữ, sử dụng, chỉnh sửa, xoá dữ liệu',
      ],
    },
    {
      title: '3. Thông tin chúng tôi thu thập',
      content: [
        '3.1. Thông tin do bạn cung cấp',
        '•\tHọ tên',
        '•\tEmail, số điện thoại',
        '•\tĐịa chỉ căn hộ',
        '•\tThông tin tài khoản đăng nhập',
        '•\tYêu cầu hỗ trợ, phản hồi, khiếu nại',
        '',
        '3.2. Thông tin phát sinh trong quá trình sử dụng',
        '•\tID tủ, kích thước tủ',
        '•\tThời gian đặt tủ, mở/đóng tủ',
        '•\tThời gian sử dụng và trạng thái tủ',
        '•\tLịch sử giao dịch, trạng thái thanh toán',
        '',
        '3.3. Thông tin thanh toán',
        '•\tTrạng thái thanh toán (thành công/thất bại)',
        '•\tMã giao dịch từ bên thứ ba',
        '⚠️ Chúng tôi không lưu thông tin thẻ, tài khoản ngân hàng hoặc ví điện tử.',
        '',
        '3.4. Thông tin kỹ thuật',
        '•\tĐịa chỉ IP',
        '•\tThiết bị, hệ điều hành, trình duyệt',
        '•\tLog hệ thống, thời gian truy cập',
      ],
    },
    {
      title: '4. Mục đích sử dụng dữ liệu',
      content: [
        'Chúng tôi sử dụng dữ liệu để:',
        '•\tCung cấp và vận hành dịch vụ Smart Locker',
        '•\tXác thực danh tính và phân quyền mở tủ',
        '•\tTính phí, xử lý và đối soát thanh toán',
        '•\tGhi nhận lịch sử sử dụng tủ',
        '•\tPhát hiện gian lận, truy cập trái phép',
        '•\tCải thiện chất lượng sản phẩm và trải nghiệm người dùng',
        '•\tHỗ trợ khách hàng và xử lý sự cố',
        '•\tTuân thủ nghĩa vụ pháp lý',
      ],
    },
    {
      title: '5. Cơ sở pháp lý cho việc xử lý dữ liệu',
      content: [
        'Chúng tôi xử lý dữ liệu cá nhân dựa trên:',
        '•\tSự đồng ý của người dùng',
        '•\tViệc thực hiện hợp đồng cung cấp dịch vụ',
        '•\tNghĩa vụ pháp lý theo quy định hiện hành',
        '•\tLợi ích hợp pháp trong vận hành hệ thống',
      ],
    },
    {
      title: '6. Chia sẻ dữ liệu với bên thứ ba',
      content: [
        'Chúng tôi không bán dữ liệu cá nhân của bạn.',
        '',
        'Dữ liệu có thể được chia sẻ với:',
        '•\tĐối tác thanh toán (chỉ để xử lý giao dịch)',
        '•\tNhà cung cấp hạ tầng (hosting, cloud, logging)',
        '•\tBan quản lý/đơn vị vận hành tủ',
        '•\tCơ quan nhà nước có thẩm quyền theo yêu cầu pháp luật',
        '',
        'Tất cả bên thứ ba đều bị ràng buộc nghĩa vụ bảo mật.',
      ],
    },
    {
      title: '7. Lưu trữ và bảo mật dữ liệu',
      content: [
        '7.1. Biện pháp bảo mật',
        '•\tMã hóa dữ liệu (ở mức phù hợp)',
        '•\tPhân quyền truy cập theo vai trò',
        '•\tGhi log hành vi truy cập hệ thống',
        '•\tKiểm soát truy cập vật lý & kỹ thuật',
        '',
        '7.2. Thời gian lưu trữ',
        'Dữ liệu được lưu trữ:',
        '•\tTrong thời gian tài khoản còn hoạt động',
        '•\tHoặc theo yêu cầu pháp luật',
        '•\tHoặc cho mục đích giải quyết tranh chấp, kiểm toán',
      ],
    },
    {
      title: '8. Quyền của người dùng',
      content: [
        'Bạn có quyền:',
        '•\tTruy cập và xem dữ liệu cá nhân',
        '•\tChỉnh sửa hoặc cập nhật thông tin',
        '•\tYêu cầu xoá dữ liệu (trong phạm vi pháp luật cho phép)',
        '•\tRút lại sự đồng ý xử lý dữ liệu',
        '•\tKhiếu nại về việc xử lý dữ liệu cá nhân',
        '',
        'Yêu cầu có thể được gửi qua dashboard hoặc email hỗ trợ.',
      ],
    },
    {
      title: '9. Cookie và công nghệ tương tự',
      content: [
        'Chúng tôi sử dụng cookie để:',
        '•\tDuy trì phiên đăng nhập',
        '•\tTăng cường bảo mật',
        '•\tPhân tích hành vi sử dụng (ẩn danh)',
        '',
        'Bạn có thể tắt cookie trong trình duyệt, nhưng một số tính năng có thể không hoạt động đúng.',
      ],
    },
    {
      title: '10. Dữ liệu của trẻ em',
      content: [
        'Dịch vụ VLocker không dành cho trẻ em dưới 16 tuổi.',
        'Chúng tôi không cố ý thu thập dữ liệu cá nhân của trẻ em.',
      ],
    },
    {
      title: '11. Truy cập từ bên thứ ba',
      content: [
        'Website có thể chứa liên kết tới dịch vụ bên thứ ba.',
        'Chúng tôi không chịu trách nhiệm cho chính sách quyền riêng tư của các bên này.',
      ],
    },
    {
      title: '12. Thay đổi Chính sách Quyền riêng tư',
      content: [
        'Chúng tôi có thể cập nhật chính sách này theo thời gian.',
        'Phiên bản mới sẽ được công bố trên website và có hiệu lực ngay khi đăng tải.',
      ],
    },
    {
      title: '13. Liên hệ',
      content: [
        'Nếu bạn có câu hỏi hoặc yêu cầu liên quan đến dữ liệu cá nhân, vui lòng liên hệ:',
        '•\tEmail: noreply.vlocker@gmail.com',
        '•\tHoặc gửi yêu cầu trực tiếp qua dashboard VLocker',
      ],
    },
    {
      title: '14. Hiệu lực',
      content: [
        'Việc bạn tiếp tục sử dụng Dịch vụ đồng nghĩa với việc bạn đồng ý với Chính sách Quyền riêng tư này.',
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 select-none">
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Chính sách Bảo mật</h1>
            <p className="text-gray-600">Cập nhật lần cuối: 01/01/2025</p>
          </div>

          <div className="prose prose-lg max-w-none mx-auto text-gray-700 space-y-8">
            <p>VLocker (“chúng tôi”, “VLocker”) cam kết tôn trọng và bảo vệ quyền riêng tư của người dùng khi bạn truy cập và sử dụng hệ thống Smart Locker, bao gồm website, web dashboard, API, phần mềm và thiết bị liên quan (gọi chung là “Dịch vụ”).</p>
            <p>Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ dữ liệu cá nhân của bạn.</p>
            {policies.map((policy, index) => (
              <div key={index}>
                <h2 className="text-2xl font-semibold text-gray-900">{policy.title}</h2>
                {policy.content.map((paragraph, pIndex) => {
                  // Các mục con như "3.1. ..."
                  if (/^\d+\.\d+\./.test(paragraph)) {
                    return <p key={pIndex} className="font-bold !mt-6 !mb-2">{paragraph}</p>;
                  }
                  // Các mục có dấu đầu dòng
                  if (paragraph.startsWith('•\t')) {
                    return <p key={pIndex} className="!m-0 !p-0 ml-6">{paragraph.replace('•\t', '• ')}</p>;
                  }
                  // Các thông báo cảnh báo
                  if (paragraph.startsWith('⚠️')) {
                    return <p key={pIndex} className="!my-2 font-medium">{paragraph}</p>;
                  }
                  // Bỏ qua các dòng trống để không tạo khoảng trắng thừa
                  if (paragraph.trim() === '') return null;
                  return <p key={pIndex}>{paragraph}</p>;
                })}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
