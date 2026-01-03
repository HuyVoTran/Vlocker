"use client";

export default function TermsOfService() {
  const terms = [
    {
      title: "1. Chấp nhận Điều khoản",
      content: [
        "Bằng việc truy cập hoặc sử dụng dịch vụ VLocker ('Dịch vụ'), bạn đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này ('Điều khoản'). Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, bạn không được phép truy cập Dịch vụ."
      ]
    },
    {
      title: "2. Mô tả Dịch vụ",
      content: [
        "VLocker cung cấp một nền tảng phần mềm và hệ thống tủ khóa thông minh để quản lý việc gửi, nhận và lưu trữ hàng hóa tạm thời tại các khu dân cư. Dịch vụ bao gồm ứng dụng web cho cư dân và ban quản lý, cùng với hệ thống điều khiển tủ khóa."
      ]
    },
    {
      title: "3. Tài khoản Người dùng",
      content: [
        "Bạn phải đăng ký tài khoản để sử dụng các tính năng của Dịch vụ. Bạn đồng ý cung cấp thông tin chính xác, hiện tại và đầy đủ trong quá trình đăng ký.",
        "Bạn chịu trách nhiệm bảo mật mật khẩu của mình và cho tất cả các hoạt động xảy ra dưới tài khoản của bạn. Bạn phải thông báo ngay cho chúng tôi về bất kỳ hành vi sử dụng trái phép tài khoản nào."
      ]
    },
    {
      title: "4. Phí và Thanh toán",
      content: [
        "Phí sử dụng dịch vụ lưu trữ sẽ được tính dựa trên thời gian sử dụng thực tế và được hiển thị rõ ràng trước khi bạn thực hiện thanh toán.",
        "Người dùng (Cư dân) có nghĩa vụ thanh toán đầy đủ các khoản phí phát sinh để có thể mở tủ và nhận hàng. Tất cả các khoản thanh toán được xử lý thông qua các cổng thanh toán của bên thứ ba và chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn."
      ]
    },
    {
      title: "5. Quy định sử dụng",
      content: [
        "Bạn đồng ý không sử dụng Dịch vụ cho bất kỳ mục đích bất hợp pháp nào hoặc để lưu trữ các vật phẩm bị cấm theo quy định của pháp luật (ví dụ: chất cháy nổ, hàng cấm, động vật sống).",
        "Bạn chịu trách nhiệm về tình trạng của tủ sau khi sử dụng. Vui lòng đảm bảo tủ được đóng lại đúng cách sau khi lấy hàng để hoàn tất phiên sử dụng."
      ]
    },
    {
      title: "6. Giới hạn Trách nhiệm",
      content: [
        "Trong phạm vi tối đa được pháp luật cho phép, VLocker sẽ không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, do hậu quả hoặc mang tính trừng phạt nào, hoặc bất kỳ tổn thất nào về lợi nhuận hoặc doanh thu, cho dù phát sinh trực tiếp hay gián tiếp, hoặc bất kỳ mất mát dữ liệu, việc sử dụng, thiện chí, hoặc các tổn thất vô hình khác, phát sinh từ (i) việc bạn truy cập hoặc sử dụng hoặc không thể truy cập hoặc sử dụng Dịch vụ; (ii) bất kỳ hành vi hoặc nội dung nào của bất kỳ bên thứ ba nào trên Dịch vụ."
      ]
    },
    {
      title: "7. Chấm dứt",
      content: [
        "Chúng tôi có thể chấm dứt hoặc đình chỉ quyền truy cập của bạn vào Dịch vụ ngay lập tức, không cần thông báo trước hoặc chịu trách nhiệm, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn nếu bạn vi phạm các Điều khoản."
      ]
    },
    {
      title: "8. Thay đổi Điều khoản",
      content: [
        "Chúng tôi có quyền, theo quyết định riêng của mình, sửa đổi hoặc thay thế các Điều khoản này vào bất kỳ lúc nào. Bằng cách tiếp tục truy cập hoặc sử dụng Dịch vụ của chúng tôi sau khi các sửa đổi đó có hiệu lực, bạn đồng ý bị ràng buộc bởi các điều khoản đã sửa đổi."
      ]
    },
    {
      title: "9. Liên hệ",
      content: [
        "Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ với chúng tôi qua trang Liên hệ."
      ]
    }
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
            {terms.map((term, index) => (
              <div key={index}>
                <h2 className="text-2xl font-semibold text-gray-900">{term.title}</h2>
                <div className="space-y-4">
                  {term.content.map((paragraph, pIndex) => (
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
