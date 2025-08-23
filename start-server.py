#!/usr/bin/env python3
"""
PageMiner Landing Page Local Server
解决CORS问题，启动本地服务器来预览网站
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

def start_server(port=8000):
    """启动本地HTTP服务器"""
    
    # 获取当前目录
    current_dir = Path(__file__).parent.absolute()
    os.chdir(current_dir)
    
    # 创建HTTP服务器
    Handler = http.server.SimpleHTTPRequestHandler
    
    # 添加CORS头
    class CORSRequestHandler(Handler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
    
    try:
        with socketserver.TCPServer(("", port), CORSRequestHandler) as httpd:
            print(f"🚀 PageMiner 本地服务器已启动!")
            print(f"📱 请在浏览器中访问: http://localhost:{port}")
            print(f"📁 服务目录: {current_dir}")
            print(f"⏹️  按 Ctrl+C 停止服务器")
            print("-" * 50)
            
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {port} 已被占用，尝试使用端口 {port + 1}")
            start_server(port + 1)
        else:
            print(f"❌ 启动服务器失败: {e}")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
        sys.exit(0)

if __name__ == "__main__":
    print("🌐 PageMiner 网站本地服务器")
    print("=" * 50)
    
    # 检查Python版本
    if sys.version_info < (3, 6):
        print("❌ 需要Python 3.6或更高版本")
        sys.exit(1)
    
    # 启动服务器
    start_server()
