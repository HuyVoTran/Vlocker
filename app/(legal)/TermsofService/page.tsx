"use client";

export default function TermsOfService() {
  const terms = [
    {
      title: "1. Giới thiệu & Phạm vi",
      content: [
        "VLocker cung cấp hệ thống tủ khóa thông minh dùng cho lưu trữ ngắn hạn, cho phép người dùng:",
        "•\tĐặt tủ",
        "•\tGửi và lấy đồ",
        "•\tThanh toán theo thời gian sử dụng",
        "•\tQuản lý qua web dashboard",
        "",
        "Các Điều khoản này áp dụng cho tất cả người dùng.",
      ],
    },
    {
      title: "2. Điều kiện sử dụng",
      content: [
        "Để sử dụng Dịch vụ, bạn xác nhận rằng:",
        "•\tBạn từ 16 tuổi trở lên",
        "•\tBạn có đầy đủ năng lực hành vi dân sự",
        "•\tThông tin cung cấp là chính xác và cập nhật",
        "",
        "VLocker có quyền từ chối hoặc chấm dứt dịch vụ nếu phát hiện vi phạm.",
      ],
    },
    {
      title: "3. Tài khoản người dùng",
      content: [
        "•\tBạn chịu trách nhiệm bảo mật thông tin đăng nhập",
        "•\tMọi hoạt động phát sinh từ tài khoản được xem là do bạn thực hiện",
        "•\tKhông chia sẻ tài khoản cho bên thứ ba trái phép",
      ],
    },
    {
      title: "4. Quy trình sử dụng Smart Locker",
      content: [
        "1.\tNgười dùng đặt tủ trên dashboard",
        "2.\tĐồ được bỏ vào tủ",
        "3.\tNgười dùng đóng và khoá tủ → bắt đầu tính phí",
        "4.\tPhí được tính theo ngày và kích thước tủ",
        "5.\tThanh toán là bắt buộc để mở tủ và lấy đồ",
      ],
    },
    {
      title: "5. Phí dịch vụ & Thanh toán",
      content: [
        "•\tMức phí được hiển thị rõ trước khi xác nhận sử dụng",
        "•\tPhí tính theo ngày, có thể làm tròn theo chính sách hệ thống",
        "•\tThanh toán được xử lý qua bên thứ ba",
        "•\tKhông hoàn tiền cho thời gian đã sử dụng, trừ khi có lỗi hệ thống",
      ],
    },
    {
      title: "6. Quy định về vật phẩm lưu trữ",
      content: [
        "6.1. Vật phẩm bị cấm",
        "Người dùng không được lưu trữ:",
        "•\tChất cấm, chất cháy nổ, vũ khí",
        "•\tThực phẩm dễ hư hỏng",
        "•\tĐộng vật sống",
        "•\tHàng hoá trái pháp luật",
        "",
        "6.2. Trách nhiệm về vật phẩm",
        "•\tBạn chịu trách nhiệm hoàn toàn về vật phẩm lưu trữ",
        "•\tVLocker không kiểm tra nội dung bên trong tủ",
        "•\tKhông chịu trách nhiệm với hao mòn tự nhiên của vật phẩm",
      ],
    },
    {
      title: "7. Giới hạn trách nhiệm",
      content: [
        "VLocker không chịu trách nhiệm đối với:",
        "•\tThiệt hại gián tiếp, mất mát dữ liệu",
        "•\tGiá trị tinh thần hoặc cơ hội kinh doanh",
        "•\tSự cố ngoài tầm kiểm soát (mất điện, thiên tai, lỗi mạng)",
        "",
        "Giá trị bồi thường (nếu có) không vượt quá tổng phí bạn đã thanh toán cho lần sử dụng đó.",
      ],
    },
    {
      title: "8. Sự cố, can thiệp và mở tủ cưỡng chế",
      content: [
        "•\tTrong trường hợp khẩn cấp, quản lý có quyền mở tủ",
        "•\tMọi can thiệp sẽ được ghi nhận trên hệ thống",
        "•\tNgười dùng chịu chi phí phát sinh (nếu có)",
      ],
    },
    {
      title: "9. Tạm ngưng & chấm dứt dịch vụ",
      content: [
        "VLocker có quyền:",
        "•\tTạm ngưng dịch vụ để bảo trì",
        "•\tKhoá tài khoản khi phát hiện hành vi vi phạm",
        "•\tChấm dứt dịch vụ mà không cần báo trước trong trường hợp nghiêm trọng",
      ],
    },
    {
      title: "10. Sở hữu trí tuệ",
      content: [
        "•\tToàn bộ phần mềm, giao diện, logo thuộc sở hữu của VLocker",
        "•\tNgười dùng không được sao chép, khai thác trái phép",
      ],
    },
    {
      title: "11. Bảo mật & Quyền riêng tư",
      content: [
        "Việc xử lý dữ liệu cá nhân tuân theo Privacy Policy của VLocker.",
        "Bằng việc sử dụng Dịch vụ, bạn đồng ý với chính sách này.",
      ],
    },
    {
      title: "12. Luật áp dụng & giải quyết tranh chấp",
      content: [
        "•\tĐiều khoản này được điều chỉnh bởi pháp luật Việt Nam",
        "•\tMọi tranh chấp sẽ được ưu tiên giải quyết thông qua thương lượng",
        "•\tNếu không đạt được thỏa thuận, tranh chấp sẽ do tòa án có thẩm quyền giải quyết",
      ],
    },
    {
      title: "13. Thay đổi Điều khoản",
      content: [
        "VLocker có thể cập nhật Điều khoản Dịch vụ theo thời gian.",
        "Phiên bản mới có hiệu lực ngay khi được công bố trên website.",
      ],
    },
    {
      title: "14. Liên hệ",
      content: [
        "Mọi thắc mắc liên quan đến Điều khoản Dịch vụ, vui lòng liên hệ:",
        "•\tEmail: noreply.vlocker@gmail.com",
        "•\tHoặc thông qua dashboard VLocker",
      ],
    },
    {
      title: "15. Hiệu lực ràng buộc",
      content: [
        "Việc tiếp tục sử dụng Dịch vụ đồng nghĩa với việc bạn đồng ý và chấp nhận toàn bộ Điều khoản Dịch vụ này.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 select-none">
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Điều khoản Dịch vụ</h1>
            <p className="text-gray-600">Cập nhật lần cuối: 01/01/2025</p>
          </div>

          <div className="prose prose-lg max-w-none mx-auto text-gray-700 space-y-8">
            <p>Chào mừng bạn đến với VLocker.</p>
            <p>Bằng việc truy cập hoặc sử dụng hệ thống Smart Locker và web dashboard VLocker (“Dịch vụ”), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này.</p>
            {terms.map((term, index) => (
              <div key={index}>
                <h2 className="text-2xl font-semibold text-gray-900">{term.title}</h2>
                {term.content.map((paragraph, pIndex) => {
                  // Sub-headings like "6.1. ..."
                  if (/^\d+\.\d+\./.test(paragraph)) {
                    return <p key={pIndex} className="font-bold !mt-6 !mb-2">{paragraph}</p>;
                  }
                  // Bullet points
                  if (paragraph.startsWith('•\t')) {
                    return <p key={pIndex} className="!m-0 !p-0 ml-6">{paragraph.replace('•\t', '• ')}</p>;
                  }
                  // Numbered list items
                  if (/^\d+\.\t/.test(paragraph)) {
                    return <p key={pIndex} className="!m-0 !p-0 ml-6">{paragraph}</p>;
                  }
                  // Ignore empty lines
                  if (paragraph.trim() === '') return null;
                  // Default paragraph
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
