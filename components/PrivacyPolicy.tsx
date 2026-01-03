"use client";

export default function PrivacyPolicy() {
  const policies = [
    {
      title: "1. Giới thiệu",
      content: [
        "Chính sách Bảo mật này mô tả cách VLocker ('chúng tôi', 'của chúng tôi') thu thập, sử dụng và chia sẻ thông tin cá nhân của bạn khi bạn sử dụng trang web và dịch vụ của chúng tôi ('Dịch vụ').",
        "Bằng cách sử dụng Dịch vụ, bạn đồng ý với việc thu thập, sử dụng và tiết lộ thông tin của bạn theo Chính sách này."
      ]
    },
    {
      title: "2. Thông tin chúng tôi thu thập",
      content: [
        "Chúng tôi thu thập các loại thông tin sau:",
        "Thông tin cá nhân: Khi bạn đăng ký tài khoản, chúng tôi thu thập thông tin như tên, email, số điện thoại, và địa chỉ (tòa nhà, block, tầng, căn hộ).",
        "Thông tin giao dịch: Khi bạn sử dụng dịch vụ thuê tủ, chúng tôi thu thập thông tin về các lượt đặt tủ, thời gian sử dụng và lịch sử thanh toán.",
        "Thông tin sử dụng: Chúng tôi có thể thu thập thông tin về cách bạn tương tác với Dịch vụ của chúng tôi, chẳng hạn như địa chỉ IP, loại trình duyệt, và các trang bạn đã truy cập."
      ]
    },
    {
      title: "3. Cách chúng tôi sử dụng thông tin của bạn",
      content: [
        "Chúng tôi sử dụng thông tin chúng tôi thu thập cho các mục đích sau:",
        "Để cung cấp, vận hành và duy trì Dịch vụ của chúng tôi.",
        "Để xử lý các giao dịch của bạn và gửi cho bạn thông tin liên quan, bao gồm xác nhận đặt tủ và hóa đơn thanh toán.",
        "Để giao tiếp với bạn, bao gồm việc trả lời các yêu cầu hỗ trợ và gửi các thông báo quan trọng về hệ thống.",
        "Để cải thiện và cá nhân hóa Dịch vụ, cũng như để phát triển các tính năng mới.",
        "Để tuân thủ các nghĩa vụ pháp lý."
      ]
    },
    {
      title: "4. Chia sẻ và Tiết lộ Thông tin",
      content: [
        "Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba.",
        "Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp dịch vụ bên thứ ba để thực hiện các chức năng thay mặt chúng tôi, chẳng hạn như xử lý thanh toán (Momo, VNPAY) và phân tích dữ liệu. Các nhà cung cấp này chỉ được phép sử dụng thông tin của bạn cho các mục đích đã được chỉ định.",
        "Chúng tôi có thể tiết lộ thông tin nếu được yêu cầu bởi pháp luật hoặc để bảo vệ quyền, tài sản và sự an toàn của chúng tôi, người dùng của chúng tôi, hoặc công chúng."
      ]
    },
    {
      title: "5. Bảo mật Dữ liệu",
      content: [
        "Chúng tôi cam kết bảo vệ thông tin của bạn. Chúng tôi sử dụng các biện pháp bảo mật hợp lý về mặt kỹ thuật và tổ chức để bảo vệ thông tin cá nhân của bạn khỏi bị mất, lạm dụng, truy cập trái phép, tiết lộ, thay đổi và phá hủy. Tuy nhiên, không có phương thức truyền tải qua Internet hoặc lưu trữ điện tử nào là an toàn 100%."
      ]
    },
    {
      title: "6. Quyền của bạn",
      content: [
        "Bạn có quyền truy cập, sửa đổi hoặc xóa thông tin cá nhân của mình. Bạn có thể thực hiện các quyền này thông qua trang Hồ sơ cá nhân trong ứng dụng hoặc bằng cách liên hệ với chúng tôi.",
        "Bạn có thể từ chối nhận các thông tin tiếp thị từ chúng tôi bằng cách làm theo hướng dẫn hủy đăng ký trong các email đó."
      ]
    },
    {
      title: "7. Thay đổi Chính sách Bảo mật này",
      content: [
        "Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này và cập nhật ngày 'Cập nhật lần cuối'. Bạn nên xem lại Chính sách Bảo mật này định kỳ."
      ]
    },
    {
      title: "8. Liên hệ với chúng tôi",
      content: [
        "Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật này, vui lòng liên hệ với chúng tôi qua trang Liên hệ của chúng tôi."
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
            {policies.map((policy, index) => (
              <div key={index}>
                <h2 className="text-2xl font-semibold text-gray-900">{policy.title}</h2>
                <div className="space-y-4">
                  {policy.content.map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
